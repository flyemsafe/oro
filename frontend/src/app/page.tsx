import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Tag, Star, Search } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center space-y-8 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl">
            <span className="bg-gradient-to-r from-oro-orange-500 to-oro-blue-500 bg-clip-text text-transparent">
              Oro
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
            Words with Power
          </p>
          <p className="text-lg text-muted-foreground max-w-[700px] mx-auto">
            Organize, manage, and unleash the power of your AI prompts.
            Oro helps you craft, store, and retrieve your best prompts with ease.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/prompts">
            <Button size="lg" className="bg-gradient-to-r from-oro-orange-500 to-oro-orange-600 hover:from-oro-orange-600 hover:to-oro-orange-700">
              Get Started
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-oro-orange-500" />
                Organize Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Store and manage all your AI prompts in one central location with easy access.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-oro-blue-500" />
                Categorize
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Group prompts by categories and tags for quick navigation and discovery.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-oro-orange-500" />
                Mark Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Quickly access your most-used prompts by marking them as favorites.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-oro-blue-500" />
                Fast Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find the perfect prompt instantly with powerful search and filtering.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, TypeScript, and shadcn/ui
          </p>
        </div>
      </div>
    </Layout>
  )
}
