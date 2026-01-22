import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Cpu, HardDrive, AlertTriangle, CheckCircle } from 'lucide-react';
import { oracleDB } from '@/lib/oracleAdapter';

export default function OracleDemo() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [oracleInfo, setOracleInfo] = useState<any>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [demoSteps, setDemoSteps] = useState({
    connect: false,
    version: false,
    tables: false,
    query: false
  });

  const connectToOracle = async () => {
    setLoading(true);
    setConnectionStatus('connecting');
    
    try {
      await oracleDB.connect();
      setConnectionStatus('connected');
      setDemoSteps(prev => ({ ...prev, connect: true }));
      
      // Get Oracle version
      const version = await oracleDB.getOracleVersion();
      setOracleInfo({ version });
      setDemoSteps(prev => ({ ...prev, version: true }));
      
      // Get table list
      const tableList = await oracleDB.getTableList();
      setTables(tableList);
      setDemoSteps(prev => ({ ...prev, tables: true }));
      
      // Execute a sample query
      const result = await oracleDB.execute('SELECT * FROM USERS WHERE ROWNUM <= 3');
      console.log('Sample query result:', result);
      setDemoSteps(prev => ({ ...prev, query: true }));
    } catch (error) {
      console.error('Oracle connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromOracle = async () => {
    try {
      await oracleDB.disconnect();
      setConnectionStatus('disconnected');
      setOracleInfo(null);
      setTables([]);
      setDemoSteps({
        connect: false,
        version: false,
        tables: false,
        query: false
      });
    } catch (error) {
      console.error('Oracle disconnect error:', error);
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'connecting': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'disconnected': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold">Oracle Database Connection</h1>
              <p className="text-muted-foreground">
                Enterprise-grade database for exam proctoring system
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Oracle Connection</CardTitle>
                <CardDescription>
                  Connect to Oracle Database 21c Enterprise Edition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {getConnectionIcon()}
                  <div>
                    <p className="font-semibold">Status</p>
                    <p className={`text-sm ${getConnectionColor()}`}>
                      {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Host:</span>
                    <span>localhost</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Port:</span>
                    <span>1521</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span>XEPDB1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User:</span>
                    <span>exam_system</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={connectToOracle}
                    disabled={connectionStatus === 'connected' || loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {loading ? 'Connecting...' : 'Connect to Oracle'}
                  </Button>
                  {connectionStatus === 'connected' && (
                    <Button
                      onClick={disconnectFromOracle}
                      variant="outline"
                      className="w-full mt-2"
                    >
                      Disconnect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Oracle Features */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Oracle Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">High Performance</span>
                </div>
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">ACID Compliance</span>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Scalable Architecture</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Oracle Info Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Oracle Database Information</CardTitle>
                <CardDescription>
                  Connected to Oracle Database 21c Enterprise Edition
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectionStatus === 'disconnected' ? (
                  <div className="text-center py-12">
                    <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">
                      Not Connected
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click "Connect to Oracle" to establish database connection
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Connection Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-semibold">Connection</p>
                        <p className="text-2xl font-bold text-green-600">✓ Active</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-semibold">Version</p>
                        <p className="text-lg font-bold text-blue-600">
                          {oracleInfo?.version ? '21c' : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Demo Steps */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">Connection Process:</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={demoSteps.connect ? "default" : "outline"}>
                            {demoSteps.connect ? '✓' : '1'}
                          </Badge>
                          <span>Establish connection to Oracle server</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={demoSteps.version ? "default" : "outline"}>
                            {demoSteps.version ? '✓' : '2'}
                          </Badge>
                          <span>Verify Oracle version and capabilities</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={demoSteps.tables ? "default" : "outline"}>
                            {demoSteps.tables ? '✓' : '3'}
                          </Badge>
                          <span>Access database tables and schemas</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={demoSteps.query ? "default" : "outline"}>
                            {demoSteps.query ? '✓' : '4'}
                          </Badge>
                          <span>Execute sample queries</span>
                        </div>
                      </div>
                    </div>

                    {/* Tables */}
                    {tables.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Database Tables:</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {tables.map((table, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {table}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Oracle Benefits */}
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <Database className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900">Oracle Database Benefits</p>
                          <ul className="text-sm text-red-800 mt-2 space-y-1">
                            <li>• Enterprise-grade security with advanced encryption</li>
                            <li>• High availability with Real Application Clusters (RAC)</li>
                            <li>• Advanced analytics and machine learning integration</li>
                            <li>• ACID compliance for data integrity</li>
                            <li>• Scalable performance for thousands of concurrent users</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}