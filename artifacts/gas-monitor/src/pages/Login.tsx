<div className={isLogin ? "" : "hidden"}>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Email</Label>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="name@example.com" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Password</Label>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-md" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </div>

        <div className={isLogin ? "hidden" : ""}>
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Full Name</Label>
                    <FormControl>
                      <Input type="text" autoComplete="name" placeholder="John Doe" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Email</Label>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="name@example.com" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-[var(--color-on-surface)]">Password</Label>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} className="bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus-visible:ring-[var(--color-primary)]" />
                    </FormControl>
                    <FormMessage className="text-[var(--color-error)]" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-md" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Registering..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </div>
