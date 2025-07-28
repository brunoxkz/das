import React, { useState } from 'react';
import { Plus, Edit, Trash2, Settings, Users, BarChart3, FileText, Clock, Save, Eye, Layout, Code, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  status: 'published' | 'draft';
  author: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'upcoming' | 'past';
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscriptionDate: string;
  status: 'active' | 'unsubscribed';
}

export default function QuantumCMS() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Sample data
  const [newsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Revolutionary AI-Powered Task Management Platform Launched',
      content: 'Quantum Tasks introduces cutting-edge artificial intelligence to streamline productivity workflows...',
      date: '2025-01-28',
      status: 'published',
      author: 'Admin'
    },
    {
      id: '2',
      title: 'WordPress Integration Now Available',
      content: 'Seamlessly integrate Quantum Tasks with your WordPress site using our new Elementor compatibility...',
      date: '2025-01-27',
      status: 'draft',
      author: 'Admin'
    }
  ]);

  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Quantum Tasks Product Demo',
      description: 'Join us for a comprehensive demonstration of our AI-powered task management features',
      date: '2025-02-15',
      location: 'Virtual Event',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'WordPress Integration Workshop',
      description: 'Learn how to integrate Quantum Tasks with your existing WordPress infrastructure',
      date: '2025-02-22',
      location: 'Online',
      status: 'upcoming'
    }
  ]);

  const [subscribers] = useState<Subscriber[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      subscriptionDate: '2025-01-15',
      status: 'active'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      subscriptionDate: '2025-01-20',
      status: 'active'
    },
    {
      id: '3',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      subscriptionDate: '2025-01-25',
      status: 'unsubscribed'
    }
  ]);

  const stats = {
    totalNews: newsItems.length,
    publishedNews: newsItems.filter(item => item.status === 'published').length,
    totalEvents: events.length,
    upcomingEvents: events.filter(event => event.status === 'upcoming').length,
    totalSubscribers: subscribers.length,
    activeSubscribers: subscribers.filter(sub => sub.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Layout className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Quantum CMS</h1>
                <p className="text-purple-200 text-sm">AI-Powered Content Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Eye className="h-4 w-4 mr-2" />
                Preview Site
              </Button>
              <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-500/20">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-6 bg-black/20 backdrop-blur-md border border-white/10">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Latest News
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="design" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Palette className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Code className="h-4 w-4 mr-2" />
              WordPress
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
              <p className="text-purple-200">Monitor your content and engagement metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-200">Total News Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalNews}</div>
                  <div className="text-xs text-green-400 mt-1">
                    {stats.publishedNews} published
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-200">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
                  <div className="text-xs text-blue-400 mt-1">
                    {stats.totalEvents} total events
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-200">Newsletter Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.activeSubscribers}</div>
                  <div className="text-xs text-cyan-400 mt-1">
                    {stats.totalSubscribers} total subscribers
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-200">Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">87%</div>
                  <div className="text-xs text-emerald-400 mt-1">
                    +12% from last month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-purple-200">
                  Latest content updates and user interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 text-white">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New article published: "Revolutionary AI-Powered Task Management Platform Launched"</p>
                    <p className="text-xs text-purple-200">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-white">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New event scheduled: "Quantum Tasks Product Demo"</p>
                    <p className="text-xs text-purple-200">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-white">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">3 new newsletter subscriptions</p>
                    <p className="text-xs text-purple-200">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Management Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Latest News Management</h2>
                <p className="text-purple-200">Create and manage news articles</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => setEditingNews({ id: 'new', title: '', content: '', date: new Date().toISOString().split('T')[0], status: 'draft', author: 'Admin' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add News Article
              </Button>
            </div>

            <div className="grid gap-6">
              {newsItems.map((news) => (
                <Card key={news.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white">{news.title}</CardTitle>
                        <CardDescription className="text-purple-200 mt-2">
                          {news.content.substring(0, 150)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={news.status === 'published' ? 'default' : 'secondary'}
                               className={news.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'}>
                          {news.status}
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10"
                                onClick={() => setEditingNews(news)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-purple-200 mt-4">
                      <span>By {news.author}</span>
                      <span>•</span>
                      <span>{news.date}</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Management Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Events Management</h2>
                <p className="text-purple-200">Schedule and manage upcoming events</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => setEditingEvent({ id: 'new', title: '', description: '', date: '', location: '', status: 'upcoming' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>

            <div className="grid gap-6">
              {events.map((event) => (
                <Card key={event.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white">{event.title}</CardTitle>
                        <CardDescription className="text-purple-200 mt-2">
                          {event.description}
                        </CardDescription>
                        <div className="flex items-center space-x-4 text-sm text-purple-200 mt-4">
                          <span><Clock className="h-4 w-4 inline mr-1" />{event.date}</span>
                          <span>•</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                               className={event.status === 'upcoming' ? 'bg-blue-600' : 'bg-gray-600'}>
                          {event.status}
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10"
                                onClick={() => setEditingEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Newsletter Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Newsletter Subscribers</h2>
              <p className="text-purple-200">Manage your email newsletter subscribers</p>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Subscriber List</CardTitle>
                <CardDescription className="text-purple-200">
                  Total: {stats.totalSubscribers} subscribers, Active: {stats.activeSubscribers}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-1">
                        <div className="text-white font-medium">{subscriber.name}</div>
                        <div className="text-purple-200 text-sm">{subscriber.email}</div>
                        <div className="text-purple-300 text-xs mt-1">Subscribed: {subscriber.subscriptionDate}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                               className={subscriber.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                          {subscriber.status}
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Design Customization</h2>
              <p className="text-purple-200">Customize the visual appearance of your site</p>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Theme Settings</CardTitle>
                <CardDescription className="text-purple-200">
                  Drag and drop elements to customize your site design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Color Scheme</h3>
                    <div className="flex space-x-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg border-2 border-white"></div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg border border-white/20"></div>
                      <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg border border-white/20"></div>
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-lg border border-white/20"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Layout Options</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-white/5 rounded border border-purple-400 text-center text-sm text-white">
                        Modern Layout
                      </div>
                      <div className="p-3 bg-white/5 rounded border border-white/20 text-center text-sm text-white">
                        Classic Layout
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WordPress Integration Tab */}
          <TabsContent value="code" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">WordPress Integration</h2>
              <p className="text-purple-200">Deploy your CMS as a WordPress theme with Elementor compatibility</p>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Deployment Options</CardTitle>
                <CardDescription className="text-purple-200">
                  Generate WordPress-compatible code and Elementor widgets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button className="h-24 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex flex-col">
                    <Code className="h-8 w-8 mb-2" />
                    <span>Generate WordPress Theme</span>
                    <span className="text-xs opacity-80">Complete theme package</span>
                  </Button>
                  <Button className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex flex-col">
                    <Layout className="h-8 w-8 mb-2" />
                    <span>Export Elementor Widgets</span>
                    <span className="text-xs opacity-80">Drag & drop components</span>
                  </Button>
                </div>
                
                <Separator className="bg-white/20" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Generated Code Preview</h3>
                  <div className="bg-black/40 p-4 rounded-lg border border-white/10 font-mono text-sm text-green-400 overflow-x-auto">
                    <div className="text-purple-300">// WordPress Theme Functions</div>
                    <div>function quantum_cms_theme_setup() {'{'}}</div>
                    <div className="ml-4">add_theme_support('post-thumbnails');</div>
                    <div className="ml-4">register_nav_menus(array(...));</div>
                    <div>{'}'}</div>
                    <div className="mt-2 text-purple-300">// Elementor Widget Registration</div>
                    <div>class Quantum_News_Widget extends \Elementor\Widget_Base {'{'}...{'}'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}