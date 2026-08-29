'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, X, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();

  // Create Org state
  const [orgName, setOrgName] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [departments, setDepartments] = useState<string[]>([
    'Engineering',
    'Product',
    'Operations',
  ]);
  const [isCreating, setIsCreating] = useState(false);

  // Join Org state
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleAddDepartment = () => {
    const trimmed = departmentInput.trim();
    if (trimmed && !departments.includes(trimmed)) {
      setDepartments([...departments, trimmed]);
      setDepartmentInput('');
    }
  };

  const handleRemoveDepartment = (deptToRemove: string) => {
    setDepartments(departments.filter((dept) => dept !== deptToRemove));
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsCreating(true);
    try {
      // Placeholder async operation: Clerk organization creation will be wired later
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create organization:', error);
      setIsCreating(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    try {
      // Placeholder async operation: Clerk organization join will be wired later
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to join organization:', error);
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <img
            src="/axoria-logo.svg"
            alt="Axoria"
            className="h-12 w-12 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to Axoria
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your workspace to start building organizational capacity
          </p>
        </div>

        {/* Setup Card */}
        <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-border">
                <Building2 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Organization Setup
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Create a new organization or join an existing one
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create">Create Organization</TabsTrigger>
                <TabsTrigger value="join">Join Organization</TabsTrigger>
              </TabsList>

              {/* Create Organization Tab */}
              <TabsContent value="create" className="space-y-4">
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="org-name" className="text-xs font-medium">
                      Organization Name
                    </Label>
                    <Input
                      id="org-name"
                      placeholder="e.g. Acme Technologies"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="department-input" className="text-xs font-medium">
                      Departments & Teams
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="department-input"
                        placeholder="e.g. Human Resources"
                        value={departmentInput}
                        onChange={(e) => setDepartmentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDepartment();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddDepartment}
                        disabled={!departmentInput.trim()}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {/* Department Badges List */}
                    {departments.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {departments.map((dept) => (
                          <Badge
                            key={dept}
                            variant="secondary"
                            className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-normal border border-border bg-surface text-foreground"
                          >
                            <span>{dept}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDepartment(dept)}
                              className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-sm transition-colors focus:outline-none"
                              aria-label={`Remove ${dept}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground pt-1">
                        No departments added yet. Add at least one department.
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={isCreating || !orgName.trim()}
                  >
                    {isCreating ? (
                      'Setting up workspace...'
                    ) : (
                      <>
                        <span>Create & Continue</span>
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Join Organization Tab */}
              <TabsContent value="join" className="space-y-4">
                <form onSubmit={handleJoinOrganization} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-code" className="text-xs font-medium">
                      Invite Code
                    </Label>
                    <Input
                      id="invite-code"
                      placeholder="e.g. AXO-8924-XYZ"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Ask your organization administrator for an invite code or link.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={isJoining || !inviteCode.trim()}
                  >
                    {isJoining ? (
                      'Joining organization...'
                    ) : (
                      <>
                        <span>Join Organization</span>
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
