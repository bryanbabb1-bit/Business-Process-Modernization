"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <Header title="Settings" description="Configure your BPM Tool instance" />
      <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>
                  Configure the Anthropic API key for AI-powered analysis.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Anthropic API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-ant-..."
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Set via the ANTHROPIC_API_KEY environment variable. See .env.example for details.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="uploadDir">Upload Directory</Label>
              <Input
                id="uploadDir"
                placeholder="./uploads"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Set via the UPLOAD_DIR environment variable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
