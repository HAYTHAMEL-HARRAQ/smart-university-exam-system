import type { Express, Request, Response } from "express";

/**
 * Mock OAuth Server - simulates an OAuth provider for development
 * Provides /app-auth endpoint and OAuth token exchange
 */
export function registerMockOAuthRoutes(app: Express) {
  // Mock OAuth Portal - displays login page and redirects back with auth code
  app.get("/app-auth", (req: Request, res: Response) => {
    const appId = req.query.appId as string;
    const redirectUri = req.query.redirectUri as string;
    const state = req.query.state as string;
    const type = req.query.type as string;

    if (!appId || !redirectUri || !state) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    // Simple HTML login form that auto-submits
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock OAuth Login</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f5f5f5; margin: 0; }
          .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
          h1 { color: #333; margin-top: 0; }
          button { background: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem; }
          button:hover { background: #0056b3; }
          .info { margin: 1rem 0; font-size: 0.9rem; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Mock OAuth Login</h1>
          <p class="info">This is a development mock OAuth server.</p>
          <p class="info">Click below to proceed with test login.</p>
          <button onclick="login()">Continue with Test Account</button>
        </div>
        <script>
          function login() {
            const authCode = 'mock-auth-code-' + Date.now();
            const state = '${state}';
            const redirectUri = '${redirectUri}';
            const url = redirectUri + '?code=' + encodeURIComponent(authCode) + '&state=' + encodeURIComponent(state);
            window.location.href = url;
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });

  // Mock token exchange endpoint
  app.post("/webdev.v1.WebDevAuthPublicService/ExchangeToken", (req: Request, res: Response) => {
    const { code, state } = req.body;

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    // Return mock access token
    res.json({
      accessToken: "mock-access-token-" + Date.now(),
      tokenType: "Bearer",
      expiresIn: 3600,
    });
  });

  // Mock user info endpoint
  app.post("/webdev.v1.WebDevAuthPublicService/GetUserInfo", (req: Request, res: Response) => {
    const { accessToken } = req.body;

    if (!accessToken) {
      res.status(400).json({ error: "accessToken is required" });
      return;
    }

    // Return mock user data
    res.json({
      openId: "mock-user-" + Math.random().toString(36).substr(2, 9),
      name: "Test User",
      email: "test@example.com",
      platform: "mock",
      loginMethod: "mock",
    });
  });

  // Mock JWT user info endpoint
  app.post("/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt", (req: Request, res: Response) => {
    const { jwtToken } = req.body;

    if (!jwtToken) {
      res.status(400).json({ error: "jwtToken is required" });
      return;
    }

    res.json({
      openId: "mock-user-" + Math.random().toString(36).substr(2, 9),
      name: "Test User",
      email: "test@example.com",
      platform: "mock",
      loginMethod: "mock",
    });
  });
}
