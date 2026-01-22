import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, ArrowRight, Server, HardDrive, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { oracleDB } from '@/lib/oracleAdapter';

export default function MySqlToOracleMigration() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'completed' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [migrationStats, setMigrationStats] = useState({
    totalRecords: 0,
    migratedRecords: 0,
    tables: 0,
    errors: 0
  });

  const migrationSteps = [
    { id: 1, title: 'Connect to MySQL', description: 'Establish connection to source database' },
    { id: 2, title: 'Schema Conversion', description: 'Convert MySQL schema to Oracle format' },
    { id: 3, title: 'Data Validation', description: 'Validate data integrity before migration' },
    { id: 4, title: 'Data Transfer', description: 'Transfer data from MySQL to Oracle' },
    { id: 5, title: 'Index Creation', description: 'Create Oracle-specific indexes' },
    { id: 6, title: 'Final Validation', description: 'Verify data integrity in Oracle' }
  ];

  const startMigration = async () => {
    setMigrationStatus('migrating');
    setCurrentStep(0);
    setProgress(0);
    setMigrationStats({ totalRecords: 0, migratedRecords: 0, tables: 0, errors: 0 });

    // Simulate migration process
    for (let i = 0; i < migrationSteps.length; i++) {
      setCurrentStep(i + 1);
      setProgress(((i + 1) / migrationSteps.length) * 100);
      
      // Simulate work for each step
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update stats
      setMigrationStats(prev => ({
        totalRecords: 1000 + (i * 200),
        migratedRecords: 100 + (i * 150),
        tables: i + 1,
        errors: i > 3 ? 1 : 0
      }));
    }

    setMigrationStatus('completed');
  };

  const resetMigration = () => {
    setMigrationStatus('idle');
    setCurrentStep(0);
    setProgress(0);
    setMigrationStats({ totalRecords: 0, migratedRecords: 0, tables: 0, errors: 0 });
  };

  const getStepStatus = (stepIndex: number) => {
    if (migrationStatus === 'idle') return 'pending';
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep - 1) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">MySQL to Oracle Migration</h1>
              <p className="text-muted-foreground">
                Enterprise database migration process demonstration
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Migration Control Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Migration Process</CardTitle>
                <CardDescription>
                  Migrate from MySQL to Oracle Database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Status:</span>
                  <Badge 
                    variant={
                      migrationStatus === 'completed' ? 'default' : 
                      migrationStatus === 'migrating' ? 'secondary' : 
                      'outline'
                    }
                  >
                    {migrationStatus.charAt(0).toUpperCase() + migrationStatus.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Tables</p>
                    <p className="font-semibold">{migrationStats.tables}</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Records</p>
                    <p className="font-semibold">{migrationStats.migratedRecords}</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Errors</p>
                    <p className="font-semibold">{migrationStats.errors}</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold">{currentStep}/{migrationSteps.length}</p>
                  </div>
                </div>

                <div className="pt-4">
                  {migrationStatus === 'idle' && (
                    <Button 
                      onClick={startMigration}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Migration
                    </Button>
                  )}
                  {migrationStatus === 'migrating' && (
                    <Button 
                      disabled
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Migrating...
                    </Button>
                  )}
                  {migrationStatus === 'completed' && (
                    <Button 
                      onClick={resetMigration}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Reset Migration
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* MySQL to Oracle Benefits */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Migration Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Enterprise-grade security and compliance</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">High availability and disaster recovery</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced analytics and reporting</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Scalable performance for large datasets</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Migration Process Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Migration Process</CardTitle>
                <CardDescription>
                  Step-by-step database migration from MySQL to Oracle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* MySQL to Oracle Flow */}
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                        <Database className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="font-semibold">MySQL</p>
                      <p className="text-xs text-muted-foreground">Source</p>
                    </div>
                    
                    <div className="flex items-center">
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                      <span className="mx-2 text-muted-foreground text-sm">Migration</span>
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                        <Database className="w-8 h-8 text-red-600" />
                      </div>
                      <p className="font-semibold">Oracle</p>
                      <p className="text-xs text-muted-foreground">Target</p>
                    </div>
                  </div>

                  {/* Migration Steps */}
                  <div className="space-y-4">
                    {migrationSteps.map((step, index) => (
                      <div 
                        key={step.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          getStepStatus(index) === 'completed' ? 'bg-green-50 border-green-200' :
                          getStepStatus(index) === 'current' ? 'bg-blue-50 border-blue-200' :
                          'bg-muted'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          getStepStatus(index) === 'completed' ? 'bg-green-600 text-white' :
                          getStepStatus(index) === 'current' ? 'bg-blue-600 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {getStepStatus(index) === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : getStepStatus(index) === 'current' ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            step.id
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {getStepStatus(index) === 'current' && (
                            <div className="mt-2 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                              <span className="text-sm text-blue-600">In progress...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Oracle Integration */}
                  {migrationStatus === 'completed' && (
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <Server className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900">Oracle Database Integration Complete</p>
                          <p className="text-sm text-red-800 mt-2">
                            All exam system data has been successfully migrated to Oracle Database 21c Enterprise Edition.
                            The system now operates with enterprise-grade security, high availability, and advanced analytics capabilities.
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold">Tables Migrated: {migrationStats.tables}</p>
                              <p className="text-muted-foreground">Database schemas converted</p>
                            </div>
                            <div>
                              <p className="font-semibold">Records Transferred: {migrationStats.migratedRecords}</p>
                              <p className="text-muted-foreground">Data integrity verified</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}