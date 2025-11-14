import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import SignInDialog from '@/components/SignInDialog';
import { 
  Target, 
  Loader2, 
  Download, 
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProgressUpdate {
  stage: number;
  message: string;
  type: 'info' | 'success' | 'error';
  stageName?: string;
  data?: {
    battlecardId?: number;
    pdfUrl?: string;
  };
}

interface Battlecard {
  id: number;
  competitorName?: string;
  competitor_name?: string;
  pdfUrl?: string;
  pdf_url?: string;
  status: string;
  qualityScore?: string;
  quality_score?: string;
  totalSources?: number;
  total_sources?: number;
  createdAt?: string;
  created_at?: string;
}

const BattlecardGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [competitorInput, setCompetitorInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [generatedBattlecard, setGeneratedBattlecard] = useState<Battlecard | null>(null);
  const [recentBattlecards, setRecentBattlecards] = useState<Battlecard[]>([]);

  useEffect(() => {
    checkAuth();
    loadRecentBattlecards();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    } catch (e) {
      console.warn('Auth check failed', e);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  };

  const loadRecentBattlecards = async () => {
    try {
      const data = await apiRequest('/api/battlecards');
      setRecentBattlecards(data.battlecards || []);
    } catch (error) {
      console.error('Failed to load battlecards:', error);
    }
  };

  const generateBattlecard = async () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }

    if (!competitorInput.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a competitor name or URL',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStage('Starting...');
    setCurrentMessage('');
    setGeneratedBattlecard(null);

    try {
      const response = await apiRequest('/api/competitive-intelligence', {
        method: 'POST',
        body: JSON.stringify({
          competitorName: competitorInput.trim(),
          competitorUrl: competitorInput.trim().startsWith('http') ? competitorInput.trim() : undefined,
        }),
      });

      const sessionId = response.sessionId;
      
      const eventSource = new EventSource(`/api/progress/${sessionId}`);
      
      eventSource.onmessage = (event) => {
        try {
          const update: ProgressUpdate = JSON.parse(event.data);
          
          if (update.stageName) {
            setCurrentStage(update.stageName);
          }
          
          setCurrentMessage(update.message);
          
          if (update.stage) {
            const progressPercent = (update.stage / 4) * 100;
            setProgress(progressPercent);
          }

          if (update.type === 'success' && update.data?.battlecardId) {
            eventSource.close();
            setTimeout(async () => {
              try {
                const battlecardData = await apiRequest(`/api/battlecards/${update.data.battlecardId}`);
                setGeneratedBattlecard({
                  id: battlecardData.id,
                  competitor_name: battlecardData.competitorName,
                  pdf_url: battlecardData.pdfUrl,
                  status: battlecardData.status,
                  quality_score: battlecardData.qualityScore || '0',
                  total_sources: battlecardData.totalSources || 0,
                  created_at: battlecardData.createdAt,
                });
                setProgress(100);
                setCurrentStage('Complete');
                setCurrentMessage('Battlecard generated successfully!');
                setIsGenerating(false);
                
                toast({
                  title: 'Success!',
                  description: `Battlecard for ${competitorInput} generated successfully`,
                });

                loadRecentBattlecards();
              } catch (error) {
                console.error('Failed to fetch battlecard:', error);
                setIsGenerating(false);
              }
            }, 1000);
          }
        } catch (e) {
          console.error('Failed to parse progress update', e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        if (isGenerating) {
          setIsGenerating(false);
          toast({
            title: 'Connection Lost',
            description: 'Lost connection to progress updates. Please check dashboard for results.',
            variant: 'destructive',
          });
        }
      };

    } catch (error: any) {
      console.error('Generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate battlecard',
        variant: 'destructive',
      });
      setCurrentStage('Failed');
      setCurrentMessage(error.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async (battlecard: Battlecard) => {
    try {
      const link = document.createElement('a');
      link.href = `/api/battlecards/${battlecard.id}/pdf`;
      link.download = `${battlecard.competitor_name}-battlecard.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Target className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Competitive Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Generate Competitive Battlecards
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track what customers actually say about your competitors across Reddit, GitHub, Stack Overflow, and more
          </p>
        </div>

        <Card className="p-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="competitor" className="block text-sm font-medium text-gray-200 mb-2">
                Competitor Name or URL
              </label>
              <div className="flex gap-3">
                <Input
                  id="competitor"
                  type="text"
                  placeholder="e.g., Stripe, Auth0, or https://example.com"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateBattlecard()}
                  disabled={isGenerating}
                  className="flex-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-500"
                />
                <Button
                  onClick={generateBattlecard}
                  disabled={isGenerating || !competitorInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{currentStage}</span>
                  <span className="text-purple-400 font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-400">{currentMessage}</p>
              </div>
            )}

            {generatedBattlecard && !isGenerating && (
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Battlecard Generated Successfully!</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs font-medium">Sources</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{generatedBattlecard.total_sources}</p>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-medium">Quality</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(parseFloat(generatedBattlecard.quality_score) * 100)}%
                    </p>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-lg col-span-2">
                    <Button
                      onClick={() => downloadPDF(generatedBattlecard)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-slate-800/30 border-slate-700">
            <Users className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Customer Sentiment</h3>
            <p className="text-sm text-gray-400">
              Analyze what real customers say on Reddit, forums, and GitHub
            </p>
          </Card>
          
          <Card className="p-6 bg-slate-800/30 border-slate-700">
            <DollarSign className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Pricing Intelligence</h3>
            <p className="text-sm text-gray-400">
              Extract pricing details and complaints from community discussions
            </p>
          </Card>
          
          <Card className="p-6 bg-slate-800/30 border-slate-700">
            <TrendingUp className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Migration Patterns</h3>
            <p className="text-sm text-gray-400">
              Detect when customers are switching from competitors
            </p>
          </Card>
        </div>

        {recentBattlecards.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Battlecards</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBattlecards.slice(0, 6).map((bc) => (
                <Card
                  key={bc.id}
                  className="p-6 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                  onClick={() => downloadPDF(bc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {bc.competitorName || bc.competitor_name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {new Date(bc.createdAt || bc.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(parseFloat(bc.qualityScore || bc.quality_score || '0') * 100)}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {bc.totalSources || bc.total_sources || 0} sources
                    </span>
                    <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BattlecardGenerator;
