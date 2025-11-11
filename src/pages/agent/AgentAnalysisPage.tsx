import React, { useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Agent, AgentPerformanceData, AIAnalysis } from '../../types';
import { useToast } from '../../context/ToastContext';
import { generateAgentAnalysis } from '../../lib/gemini';
import { ApiKeyContext } from '../../context/ApiKeyContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { TrendingUpIcon, TrendingDownIcon, ChartPieIcon, ClipboardListIcon, SparklesIcon, InfoIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../../components/icons';
import { formatDistanceToNow } from '../../lib/utils';

interface AgentDetailContext {
  agent: Agent;
}

// Mock data for demonstration purposes
const generateMockPerformanceData = (agent: Agent): AgentPerformanceData => ({
  overallScore: 88,
  accuracy: { value: 96.5, trend: 'up' },
  latency: { value: 210, trend: 'down' }, // Lower is better
  taskCompletionRate: 92,
  recentActivity: [
    { id: 't1', task: 'Analyze market sentiment', status: 'Success', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 't2', task: 'Predict stock movement', status: 'Success', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 't3', task: 'Generate weekly report', status: 'Failure', timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: 't4', task: 'Analyze market sentiment', status: 'Success', timestamp: new Date(Date.now() - 14400000).toISOString() },
  ],
});


const MetricCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-surface-light p-6 rounded-lg border border-border-color h-full">
        <div className="flex items-center text-text-secondary mb-4">
            {icon}
            <h3 className="font-semibold ml-2">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const DonutChart: React.FC<{ percentage: number }> = ({ percentage }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90" width="120" height="120" viewBox="0 0 120 120">
                <circle className="text-border-color" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
                <circle className="text-accent" strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
            </svg>
            <span className="absolute text-2xl font-bold text-text-primary">{percentage}%</span>
        </div>
    );
};

const AgentAnalysisPage: React.FC = () => {
    const { agent } = useOutletContext<AgentDetailContext>();
    const { callGeminiApi } = useContext(ApiKeyContext);
    const { showToast } = useToast();
    const [performanceData] = useState(() => generateMockPerformanceData(agent));
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await callGeminiApi(() => generateAgentAnalysis(performanceData));
            if (result) {
                setAnalysis(result);
                showToast("AI analysis generated successfully!", "success");
            }
        } catch (error: any) {
            showToast(error.message || "Failed to generate AI analysis.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Performance Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Overall Score" icon={<InfoIcon className="h-5 w-5" />}>
                     <p className="text-5xl font-bold text-text-primary">{performanceData.overallScore}<span className="text-2xl text-text-secondary">/100</span></p>
                </MetricCard>
                 <MetricCard title="Accuracy" icon={<CheckCircleIcon className="h-5 w-5" />}>
                    <div className="flex items-baseline">
                        <p className="text-4xl font-bold text-text-primary">{performanceData.accuracy.value}%</p>
                        {performanceData.accuracy.trend === 'up' ? <TrendingUpIcon className="h-6 w-6 ml-2 text-green-500" /> : <TrendingDownIcon className="h-6 w-6 ml-2 text-red-500" />}
                    </div>
                </MetricCard>
                <MetricCard title="Avg. Latency" icon={<ClockIcon className="h-5 w-5" />}>
                     <div className="flex items-baseline">
                        <p className="text-4xl font-bold text-text-primary">{performanceData.latency.value}ms</p>
                        {performanceData.latency.trend === 'down' ? <TrendingUpIcon className="h-6 w-6 ml-2 text-green-500" /> : <TrendingDownIcon className="h-6 w-6 ml-2 text-red-500" />}
                    </div>
                </MetricCard>
                <MetricCard title="Task Completion" icon={<ChartPieIcon className="h-5 w-5" />}>
                    <DonutChart percentage={performanceData.taskCompletionRate} />
                </MetricCard>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <MetricCard title="AI Insights & Optimization" icon={<SparklesIcon className="h-5 w-5" />}>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full min-h-[200px]">
                            <LoadingSpinner text="Analyzing performance data..." />
                        </div>
                    ) : analysis ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">Observations</h4>
                                <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                                    {analysis.observations.map((obs, i) => <li key={i}>{obs}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-text-primary mb-3">Recommendations</h4>
                                <div className="space-y-3">
                                {analysis.recommendations.map((rec, i) => (
                                    <div key={i} className="p-3 bg-surface rounded-md border border-border-color">
                                        <p className="font-semibold text-text-primary text-sm">{rec.title}</p>
                                        <p className="text-xs text-text-secondary mt-1">{rec.description}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                             <button onClick={handleGenerateAnalysis} className="w-full text-center mt-4 text-sm text-primary hover:underline">
                                Regenerate Analysis
                            </button>
                        </div>
                    ) : (
                        <div className="text-center flex flex-col items-center justify-center h-full min-h-[200px]">
                             <p className="text-text-secondary mb-4">Get AI-powered insights to improve this agent's performance.</p>
                             <button onClick={handleGenerateAnalysis} className="inline-flex items-center justify-center bg-primary text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:-translate-y-0.5 duration-300">
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                Generate AI Insights
                            </button>
                        </div>
                    )}
                 </MetricCard>

                 <MetricCard title="Recent Activity" icon={<ClipboardListIcon className="h-5 w-5" />}>
                    <ul className="space-y-3">
                        {performanceData.recentActivity.map(activity => (
                             <li key={activity.id} className="flex justify-between items-center text-sm p-3 bg-surface rounded-md">
                                <div>
                                    <p className="text-text-primary">{activity.task}</p>
                                    <p className="text-xs text-text-secondary">{formatDistanceToNow(activity.timestamp)}</p>
                                </div>
                                {activity.status === 'Success' ? (
                                    <span className="flex items-center text-green-400 text-xs font-medium"><CheckCircleIcon className="h-4 w-4 mr-1.5"/>Success</span>
                                ) : (
                                    <span className="flex items-center text-red-400 text-xs font-medium"><XCircleIcon className="h-4 w-4 mr-1.5"/>Failure</span>
                                )}
                            </li>
                        ))}
                    </ul>
                 </MetricCard>
            </div>
        </div>
    );
};

export default AgentAnalysisPage;