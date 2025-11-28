import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <nav className="flex justify-between items-center mb-20">
          <div className="text-white text-2xl font-bold">
            SynkBoard
          </div>
          <div className="space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-white text-purple-600 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Real-Time Collaboration
            <br />
            <span className="text-yellow-300">Powered by AI</span>
          </h1>

          <p className="text-xl mb-12 text-white/90">
            Create workspaces, drag widgets, chat in real-time, and let AI help you work smarter.
            All synced instantly across your team.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6">
                Start Free →
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📝"
            title="Collaborative Notes"
            description="Edit notes together in real-time, just like Google Docs"
          />
          <FeatureCard
            icon="📊"
            title="Live Analytics"
            description="Watch your data update live with beautiful charts"
          />
          <FeatureCard
            icon="🤖"
            title="AI Assistant"
            description="Get smart summaries and insights powered by AI"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-white hover:bg-white/20 transition-all">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  );
}
