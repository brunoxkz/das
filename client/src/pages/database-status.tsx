import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Database, Server, Activity, Clock, Users, Zap } from "lucide-react";

interface DatabaseStatus {
  status: string;
  database: string;
  timestamp: string;
  message?: string;
  error?: string;
  connectionPool?: {
    total: number;
    idle: number;
    active: number;
  };
  performance?: {
    averageQueryTime: number;
    queriesPerSecond: number;
    concurrentUsers: number;
  };
}

export default function DatabaseStatus() {
  const { data: sqliteStatus, isLoading: sqliteLoading } = useQuery({
    queryKey: ['/api/database-status/sqlite'],
    refetchInterval: 10000,
  });

  const { data: postgresStatus, isLoading: postgresLoading } = useQuery({
    queryKey: ['/api/database-status/postgres'],
    refetchInterval: 10000,
    retry: false,
  });

  const getDatabaseInfo = (dbType: string) => {
    if (dbType === 'SQLite') {
      return {
        name: 'SQLite',
        description: 'Local file-based database',
        maxUsers: '~100 concurrent users',
        performance: 'Fast for small-medium workloads',
        scalability: 'Limited',
        icon: Database,
        color: 'bg-blue-500'
      };
    } else {
      return {
        name: 'PostgreSQL',
        description: 'Enterprise-grade database (Railway)',
        maxUsers: '1000+ concurrent users',
        performance: 'High performance with connection pooling',
        scalability: 'Highly scalable',
        icon: Server,
        color: 'bg-green-500'
      };
    }
  };

  const getStatusBadge = (status: DatabaseStatus | undefined, loading: boolean) => {
    if (loading) {
      return <Badge variant="secondary">Checking...</Badge>;
    }
    
    if (!status) {
      return <Badge variant="destructive">Unavailable</Badge>;
    }

    if (status.status === 'healthy') {
      return <Badge variant="default" className="bg-green-600">Online</Badge>;
    } else {
      return <Badge variant="destructive">Offline</Badge>;
    }
  };

  const renderDatabaseCard = (status: DatabaseStatus | undefined, loading: boolean, title: string) => {
    const dbInfo = getDatabaseInfo(title);
    const IconComponent = dbInfo.icon;

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${dbInfo.color} text-white`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center justify-between">
                {dbInfo.name}
                {getStatusBadge(status, loading)}
              </CardTitle>
              <CardDescription>{dbInfo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-600">Max Users</div>
              <div className="font-semibold">{dbInfo.maxUsers}</div>
            </div>
            <div>
              <div className="font-medium text-gray-600">Performance</div>
              <div className="font-semibold">{dbInfo.performance}</div>
            </div>
          </div>

          {status && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Last checked: {new Date(status.timestamp).toLocaleString()}
                  </span>
                </div>
                
                {status.message && (
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">{status.message}</span>
                  </div>
                )}

                {status.error && (
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{status.error}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Status</h1>
          <p className="text-gray-600 mt-1">
            Monitor the health and performance of your database systems
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Activity className="h-4 w-4" />
          <span>Refresh Status</span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderDatabaseCard(sqliteStatus, sqliteLoading, 'SQLite')}
        {renderDatabaseCard(postgresStatus, postgresLoading, 'PostgreSQL')}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>System Architecture</span>
          </CardTitle>
          <CardDescription>
            Current database configuration and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Current System</h3>
            <p className="text-blue-700 text-sm">
              The system automatically detects available databases and chooses the best option. 
              Currently using <strong>{sqliteStatus ? 'SQLite' : 'Unknown'}</strong> as the primary database.
            </p>
          </div>

          {postgresStatus?.error && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">PostgreSQL Available but Offline</h3>
              <p className="text-yellow-700 text-sm">
                PostgreSQL was detected but is currently unavailable. The system has automatically 
                fallen back to SQLite. To enable PostgreSQL, check your Railway deployment status.
              </p>
            </div>
          )}

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Hybrid Architecture Benefits</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Automatic failover between databases</li>
              <li>• Zero downtime during database switches</li>
              <li>• Development continues with SQLite when PostgreSQL is unavailable</li>
              <li>• Enterprise scalability when PostgreSQL is online</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}