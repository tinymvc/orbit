@extends('orbit::layout.master')

@section('content')
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Welcome back, <!-- -->Admin User<!-- -->!</h1>
            <p class="text-muted-foreground">Here's what's happening with your application today.</p>
        </div>
        <div class="flex items-center gap-2"><button
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Download</button><button
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"><svg
                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-arrow-up-right mr-2 h-4 w-4">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                </svg>View Report</button></div>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 class="tracking-tight text-sm font-medium">Total Revenue</h3><svg xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-dollar-sign h-4 w-4 text-muted-foreground">
                    <line x1="12" x2="12" y1="2" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            </div>
            <div class="p-6 pt-0">
                <div class="text-2xl font-bold">$45,231.89</div>
                <p class="text-xs text-muted-foreground flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-arrow-up-right h-3 w-3 text-green-600">
                        <path d="M7 7h10v10"></path>
                        <path d="M7 17 17 7"></path>
                    </svg><span class="text-green-600">+20.1%</span> <!-- -->from last month</p>
            </div>
        </div>
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 class="tracking-tight text-sm font-medium">Subscriptions</h3><svg xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-users h-4 w-4 text-muted-foreground">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>
            <div class="p-6 pt-0">
                <div class="text-2xl font-bold">+2,350</div>
                <p class="text-xs text-muted-foreground flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-arrow-up-right h-3 w-3 text-green-600">
                        <path d="M7 7h10v10"></path>
                        <path d="M7 17 17 7"></path>
                    </svg><span class="text-green-600">+180.1%</span> <!-- -->from last month</p>
            </div>
        </div>
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 class="tracking-tight text-sm font-medium">Sales</h3><svg xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-credit-card h-4 w-4 text-muted-foreground">
                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                    <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
            </div>
            <div class="p-6 pt-0">
                <div class="text-2xl font-bold">+12,234</div>
                <p class="text-xs text-muted-foreground flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-arrow-up-right h-3 w-3 text-green-600">
                        <path d="M7 7h10v10"></path>
                        <path d="M7 17 17 7"></path>
                    </svg><span class="text-green-600">+19%</span> <!-- -->from last month</p>
            </div>
        </div>
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 class="tracking-tight text-sm font-medium">Active Now</h3><svg xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-activity h-4 w-4 text-muted-foreground">
                    <path
                        d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                    </path>
                </svg>
            </div>
            <div class="p-6 pt-0">
                <div class="text-2xl font-bold">+573</div>
                <p class="text-xs text-muted-foreground flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-arrow-up-right h-3 w-3 text-green-600">
                        <path d="M7 7h10v10"></path>
                        <path d="M7 17 17 7"></path>
                    </svg><span class="text-green-600">+201</span> <!-- -->since last hour</p>
            </div>
        </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm col-span-4">
            <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="text-2xl font-semibold leading-none tracking-tight">Overview</h3>
                <p class="text-sm text-muted-foreground">Your revenue overview for the last 12 months
                </p>
            </div>
            <div class="p-6 pt-0 pl-2">
                <div class="h-[350px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div class="text-center space-y-2"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-trending-up h-12 w-12 mx-auto text-muted-foreground">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                            <polyline points="16 7 22 7 22 13"></polyline>
                        </svg>
                        <p class="text-sm text-muted-foreground">Chart visualization would go here</p>
                        <p class="text-xs text-muted-foreground">Install recharts or chart.js for data
                            visualization</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm col-span-3">
            <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="text-2xl font-semibold leading-none tracking-tight">Recent Sales</h3>
                <p class="text-sm text-muted-foreground">You made 265 sales this month.</p>
            </div>
            <div class="p-6 pt-0">
                <div class="space-y-8">
                    <div class="flex items-center"><span
                            class="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9"><span
                                class="flex h-full w-full items-center justify-center rounded-full bg-muted">OM</span></span>
                        <div class="ml-4 space-y-1 flex-1">
                            <p class="text-sm font-medium leading-none">Olivia Martin</p>
                            <p class="text-sm text-muted-foreground">olivia.martin@email.com</p>
                        </div>
                        <div class="ml-auto font-medium">+$1,999.00</div>
                    </div>
                    <div class="flex items-center"><span
                            class="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9"><span
                                class="flex h-full w-full items-center justify-center rounded-full bg-muted">JL</span></span>
                        <div class="ml-4 space-y-1 flex-1">
                            <p class="text-sm font-medium leading-none">Jackson Lee</p>
                            <p class="text-sm text-muted-foreground">jackson.lee@email.com</p>
                        </div>
                        <div class="ml-auto font-medium">+$39.00</div>
                    </div>
                    <div class="flex items-center"><span
                            class="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9"><span
                                class="flex h-full w-full items-center justify-center rounded-full bg-muted">IN</span></span>
                        <div class="ml-4 space-y-1 flex-1">
                            <p class="text-sm font-medium leading-none">Isabella Nguyen</p>
                            <p class="text-sm text-muted-foreground">isabella.nguyen@email.com</p>
                        </div>
                        <div class="ml-auto font-medium">+$299.00</div>
                    </div>
                    <div class="flex items-center"><span
                            class="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9"><span
                                class="flex h-full w-full items-center justify-center rounded-full bg-muted">WK</span></span>
                        <div class="ml-4 space-y-1 flex-1">
                            <p class="text-sm font-medium leading-none">William Kim</p>
                            <p class="text-sm text-muted-foreground">will@email.com</p>
                        </div>
                        <div class="ml-auto font-medium">+$99.00</div>
                    </div>
                    <div class="flex items-center"><span
                            class="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9"><span
                                class="flex h-full w-full items-center justify-center rounded-full bg-muted">SD</span></span>
                        <div class="ml-4 space-y-1 flex-1">
                            <p class="text-sm font-medium leading-none">Sofia Davis</p>
                            <p class="text-sm text-muted-foreground">sofia.davis@email.com</p>
                        </div>
                        <div class="ml-auto font-medium">+$39.00</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="text-2xl font-semibold leading-none tracking-tight">Recent Activity</h3>
                <p class="text-sm text-muted-foreground">Latest user activities and system events</p>
            </div>
            <div class="p-6 pt-0">
                <div class="space-y-4">
                    <div class="flex items-start gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-activity h-5 w-5 text-muted-foreground">
                                <path
                                    d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                                </path>
                            </svg>
                        </div>
                        <div class="flex-1 space-y-1">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium">John Doe</p>
                                <div
                                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                    success</div>
                            </div>
                            <p class="text-sm text-muted-foreground">Created a new account</p>
                            <p class="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-activity h-5 w-5 text-muted-foreground">
                                <path
                                    d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                                </path>
                            </svg>
                        </div>
                        <div class="flex-1 space-y-1">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium">Jane Smith</p>
                                <div
                                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                    success</div>
                            </div>
                            <p class="text-sm text-muted-foreground">Updated homepage content</p>
                            <p class="text-xs text-muted-foreground">15 minutes ago</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-activity h-5 w-5 text-muted-foreground">
                                <path
                                    d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                                </path>
                            </svg>
                        </div>
                        <div class="flex-1 space-y-1">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium">Mike Johnson</p>
                                <div
                                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80">
                                    error</div>
                            </div>
                            <p class="text-sm text-muted-foreground">Failed login attempt</p>
                            <p class="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-activity h-5 w-5 text-muted-foreground">
                                <path
                                    d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                                </path>
                            </svg>
                        </div>
                        <div class="flex-1 space-y-1">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium">Sarah Williams</p>
                                <div
                                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    warning</div>
                            </div>
                            <p class="text-sm text-muted-foreground">Changed password</p>
                            <p class="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="text-2xl font-semibold leading-none tracking-tight">Quick Actions</h3>
                <p class="text-sm text-muted-foreground">Common tasks and shortcuts</p>
            </div>
            <div class="p-6 pt-0 space-y-3"><a href="/dashboard/users"
                    class="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors">
                    <div class="space-y-1">
                        <p class="font-medium">Manage Users</p>
                        <p class="text-sm text-muted-foreground">View and manage user accounts</p>
                    </div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-users h-5 w-5 text-muted-foreground">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </a><a href="/dashboard/cms"
                    class="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors">
                    <div class="space-y-1">
                        <p class="font-medium">Edit Homepage</p>
                        <p class="text-sm text-muted-foreground">Update homepage content and media</p>
                    </div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-file-text h-5 w-5 text-muted-foreground">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                        <path d="M10 9H8"></path>
                        <path d="M16 13H8"></path>
                        <path d="M16 17H8"></path>
                    </svg>
                </a><a href="/dashboard/account"
                    class="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors">
                    <div class="space-y-1">
                        <p class="font-medium">Account Settings</p>
                        <p class="text-sm text-muted-foreground">Manage your profile and preferences
                        </p>
                    </div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-activity h-5 w-5 text-muted-foreground">
                        <path
                            d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2">
                        </path>
                    </svg>
                </a></div>
        </div>
    </div>
@stop
