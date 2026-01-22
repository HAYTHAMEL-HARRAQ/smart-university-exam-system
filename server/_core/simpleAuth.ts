import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

/**
 * Simple Auth Routes - Direct login without OAuth
 * Creates users directly in the database
 */
export function registerSimpleAuthRoutes(app: Express) {
  // Login page
  app.get("/login", (req: Request, res: Response) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login - Smart Exam System</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex; align-items: center; justify-content: center; 
            height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container { 
            background: white; padding: 3rem; border-radius: 12px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.2); 
            width: 100%; max-width: 400px;
          }
          h1 { color: #333; margin-bottom: 2rem; text-align: center; font-size: 1.8rem; }
          .form-group { margin-bottom: 1.5rem; }
          label { display: block; color: #555; margin-bottom: 0.5rem; font-weight: 500; }
          input { 
            width: 100%; padding: 0.75rem; border: 1px solid #ddd; 
            border-radius: 6px; font-size: 1rem; transition: border-color 0.3s;
          }
          input:focus { outline: none; border-color: #667eea; }
          button { 
            width: 100%; padding: 0.875rem; background: #667eea; color: white; 
            border: none; border-radius: 6px; font-size: 1rem; font-weight: 600;
            cursor: pointer; transition: background 0.3s;
          }
          button:hover { background: #5568d3; }
          .links { 
            margin-top: 1.5rem; text-align: center; font-size: 0.9rem; 
            color: #666;
          }
          .links a { 
            color: #667eea; text-decoration: none; 
            font-weight: 500; cursor: pointer;
          }
          .links a:hover { text-decoration: underline; }
          .error { color: #e74c3c; font-size: 0.9rem; margin-top: 0.25rem; display: none; }
          .success { color: #27ae60; font-size: 0.9rem; }
          .demo-users {
            background: #f0f7ff; border: 1px solid #d4e6f1; border-radius: 6px;
            padding: 1rem; margin-top: 1.5rem; font-size: 0.85rem;
          }
          .demo-users h3 { color: #333; margin-bottom: 0.5rem; }
          .demo-users p { color: #666; margin: 0.25rem 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Smart Exam System</h1>
          
          <form id="loginForm">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" placeholder="e.g., John Doe" required>
              <div class="error" id="nameError"></div>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="e.g., john@example.com" required>
              <div class="error" id="emailError"></div>
            </div>
            
            <div class="form-group">
              <label for="role">Role</label>
              <select id="role" name="role" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                <option value="student">Student</option>
                <option value="proctor">Proctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <button type="submit">Login / Sign Up</button>
          </form>
          
          <div class="demo-users">
            <h3>Demo Accounts (Auto-fill):</h3>
            <p><strong>Student:</strong> <a onclick="fillForm('Alice Johnson', 'alice@university.edu', 'student')">Alice Johnson</a></p>
            <p><strong>Proctor:</strong> <a onclick="fillForm('Bob Smith', 'bob@university.edu', 'proctor')">Bob Smith</a></p>
            <p><strong>Admin:</strong> <a onclick="fillForm('Charlie Admin', 'charlie@university.edu', 'admin')">Charlie Admin</a></p>
          </div>
        </div>
        
        <script>
          function fillForm(name, email, role) {
            document.getElementById('name').value = name;
            document.getElementById('email').value = email;
            document.getElementById('role').value = role;
          }
          
          document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const role = document.getElementById('role').value;
            
            console.log('Login attempt with:', { name, email, role });
            
            try {
              const response = await fetch('/api/simple-auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, role })
              });
              
              console.log('Login response status:', response.status);
              console.log('Response headers:', response.headers);
              
              if (response.ok) {
                console.log('Login successful, redirecting...');
                const data = await response.json();
                console.log('Response data:', data);
                
                // Check if cookie was set
                console.log('Cookies after login:', document.cookie);
                
                window.location.href = '/';
              } else {
                const error = await response.json();
                alert('Login failed: ' + (error.error || 'Unknown error'));
              }
            } catch (err) {
              alert('Error: ' + err.message);
            }
          };
        </script>
      </body>
      </html>
    `;
    
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });

  // Handle login submission
  app.post("/api/simple-auth/login", async (req: Request, res: Response) => {
    const { name, email, role } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: "name and email are required" });
      return;
    }

    try {
      // Use email as openId for simple auth
      const openId = email.toLowerCase();
      
      // Upsert user in database
      await db.upsertUser({
        openId,
        name: name || null,
        email: email || null,
        loginMethod: "simple",
        lastSignedIn: new Date(),
      });

      // Update user role
      const user = await db.getUserByOpenId(openId);
      if (user && role && ['student', 'proctor', 'admin'].includes(role)) {
        await db.updateUserRole(user.id, role as any);
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log(`[SimpleAuth] Login successful for ${email}`);
      console.log(`[SimpleAuth] Cookie options:`, cookieOptions);
      console.log(`[SimpleAuth] Cookie name: ${COOKIE_NAME}`);
      console.log(`[SimpleAuth] Session token created for ${openId}`);

      res.json({ success: true, redirect: "/" });
    } catch (error) {
      console.error("[SimpleAuth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
