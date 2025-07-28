import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('content');
  const [editingItem, setEditingItem] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch data
  const { data: news } = useQuery({
    queryKey: ['/api/admin/news'],
  });

  const { data: insights } = useQuery({
    queryKey: ['/api/admin/insights'],
  });

  const { data: solutions } = useQuery({
    queryKey: ['/api/admin/solutions'],
  });

  const { data: events } = useQuery({
    queryKey: ['/api/admin/events'],
  });

  const { data: subscribers } = useQuery({
    queryKey: ['/api/admin/newsletter/subscribers/active'],
  });

  // Mutations
  const createNewsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/news', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      setEditingItem(null);
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest('PUT', `/api/admin/news/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      setEditingItem(null);
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/news/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
    },
  });

  const createInsightMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/insights', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/insights'] });
      setEditingItem(null);
    },
  });

  const updateInsightMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest('PUT', `/api/admin/insights/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/insights'] });
      setEditingItem(null);
    },
  });

  const deleteInsightMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/insights/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/insights'] });
    },
  });

  const handleSaveNews = (data: any) => {
    if (editingItem?.id) {
      updateNewsMutation.mutate({ id: editingItem.id, data });
    } else {
      createNewsMutation.mutate(data);
    }
  };

  const handleSaveInsight = (data: any) => {
    if (editingItem?.id) {
      updateInsightMutation.mutate({ id: editingItem.id, data });
    } else {
      createInsightMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-purple-900 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Admin Panel
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-md">
            <TabsTrigger value="content" className="data-[state=active]:bg-purple-600">
              Site Content
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-purple-600">
              Latest News
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
              Insights
            </TabsTrigger>
            <TabsTrigger value="solutions" className="data-[state=active]:bg-purple-600">
              Solutions
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="data-[state=active]:bg-purple-600">
              Newsletter
            </TabsTrigger>
          </TabsList>

          {/* Latest News Management */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Latest News Management</h2>
              <Button
                onClick={() => setEditingItem({ type: 'news' })}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add News
              </Button>
            </div>

            <div className="grid gap-6">
              {news?.map((item: any) => (
                <Card key={item.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{item.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <span className="text-sm text-gray-300">
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem({ ...item, type: 'news' })}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNewsMutation.mutate(item.id)}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{item.excerpt}</p>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="mt-4 w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Management */}
          <TabsContent value="insights" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Institutional Insights Management</h2>
              <Button
                onClick={() => setEditingItem({ type: 'insight' })}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Insight
              </Button>
            </div>

            <div className="grid gap-6">
              {insights?.map((item: any) => (
                <Card key={item.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{item.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <span className="text-sm text-gray-300">
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-300">
                            {item.readTime} min read
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem({ ...item, type: 'insight' })}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteInsightMutation.mutate(item.id)}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{item.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Newsletter Management */}
          <TabsContent value="newsletter" className="space-y-6">
            <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Active Subscribers: {subscribers?.length || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subscribers?.map((subscriber: any) => (
                    <div key={subscriber.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <span className="text-white">{subscriber.email}</span>
                      <span className="text-sm text-gray-300">
                        {new Date(subscriber.subscribedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingItem.id ? 'Edit' : 'Add'} {editingItem.type === 'news' ? 'News' : 'Insight'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    title: formData.get('title'),
                    excerpt: formData.get('excerpt'),
                    content: formData.get('content'),
                    imageUrl: formData.get('imageUrl'),
                    isPublished: formData.get('isPublished') === 'on',
                    readTime: editingItem.type === 'insight' ? parseInt(formData.get('readTime') as string) : undefined,
                  };

                  if (editingItem.type === 'news') {
                    handleSaveNews(data);
                  } else {
                    handleSaveInsight(data);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <Input
                    name="title"
                    defaultValue={editingItem.title}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Excerpt</label>
                  <Textarea
                    name="excerpt"
                    defaultValue={editingItem.excerpt}
                    className="bg-white/10 border-white/20 text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Content</label>
                  <Textarea
                    name="content"
                    defaultValue={editingItem.content}
                    className="bg-white/10 border-white/20 text-white"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Image URL</label>
                  <Input
                    name="imageUrl"
                    defaultValue={editingItem.imageUrl}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {editingItem.type === 'insight' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Read Time (minutes)</label>
                    <Input
                      name="readTime"
                      type="number"
                      defaultValue={editingItem.readTime || 5}
                      className="bg-white/10 border-white/20 text-white"
                      min="1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPublished"
                    id="isPublished"
                    defaultChecked={editingItem.isPublished}
                    className="rounded"
                  />
                  <label htmlFor="isPublished" className="text-sm text-white">
                    Published
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                    disabled={createNewsMutation.isPending || updateNewsMutation.isPending || createInsightMutation.isPending || updateInsightMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingItem(null)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}