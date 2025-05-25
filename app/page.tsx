import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Lock, Key, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Shield className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">
                VeriGate<span className="text-xs align-top">™</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Register
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full min-h-[calc(100vh-4rem)] flex items-center bg-gradient-to-br from-white via-gray-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
          <div className="container my-auto py-16">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    OAuth 2.0 Authentication Platform
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Trusted Authentication Gateway
                  </h1>
                  <p className="max-w-[600px] text-lg text-muted-foreground">
                    VeriGate™ is an OAuth 2.0-based authentication platform for secure user authentication and access
                    control in modern digital environments.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-12 px-6">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="h-12 px-6">
                      Sign In
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Enterprise Security</h3>
                      <p className="text-sm text-muted-foreground">Bank-level security protocols</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">PKCE Support</h3>
                      <p className="text-sm text-muted-foreground">Enhanced authorization flow</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Easy Integration</h3>
                      <p className="text-sm text-muted-foreground">Works with all your apps</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Centralized Control</h3>
                      <p className="text-sm text-muted-foreground">Manage from one dashboard</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center relative">
                <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[450px] h-[450px] flex items-center justify-center">
                  <div className="relative h-[350px] w-[350px] rounded-full bg-gradient-to-b from-emerald-500/20 to-emerald-500/0 flex items-center justify-center">
                    <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                      <Shield className="h-24 w-24 text-emerald-600" />
                    </div>
                    <div className="absolute top-10 -left-10 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                      <Lock className="h-8 w-8 text-emerald-600 mb-2" />
                      <p className="text-sm font-medium">Secure Authentication</p>
                    </div>
                    <div className="absolute bottom-10 -right-10 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                      <Key className="h-8 w-8 text-emerald-600 mb-2" />
                      <p className="text-sm font-medium">Access Control</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-emerald-600" />
                <span className="font-bold text-xl">
                  VeriGate<span className="text-xs align-top">™</span>
                </span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Secure OAuth 2.0 authentication platform for modern digital environments. Simplifying authentication for
                developers and businesses.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-4">Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">VeriGate™ © 2024. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
