"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Save, Globe, Sparkles } from "lucide-react";

// Assuming we get the tenantId from somewhere (e.g. context or auth session)
// For MVP we hardcode a demo tenantId
const TENANT_ID = "tenant-1"; 

const formSchema = z.object({
  namaUsaha: z.string().min(2, {
    message: "Nama Usaha must be at least 2 characters.",
  }),
  sapaanPelanggan: z.string().min(1, {
    message: "Sapaan Pelanggan is required.",
  }),
  gayaBahasa: z.string(),
  aturanKhusus: z.string().optional(),
  basaBasi_p: z.string().optional(),
  basaBasi_halo: z.string().optional(),
  basaBasi_terimakasih: z.string().optional(),
  basaBasi_ok: z.string().optional(),
  knowledgeUrl: z.string().url({ message: "Invalid URL format" }).optional().or(z.literal("")),
});

export default function AISettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{title: string, desc: string, type: 'success' | 'error'} | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaUsaha: "",
      sapaanPelanggan: "Kak",
      gayaBahasa: "Formal",
      aturanKhusus: "",
      basaBasi_p: "Halo kak, ada yang bisa kami bantu?",
      basaBasi_halo: "Halo! Selamat datang di layanan kami.",
      basaBasi_terimakasih: "Sama-sama kak, senang bisa membantu!",
      basaBasi_ok: "Baik kak, siap di laksanakan!",
      knowledgeUrl: "",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/ai-settings?tenantId=${TENANT_ID}`);
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            form.setValue("namaUsaha", data.settings.namaUsaha || "");
            form.setValue("sapaanPelanggan", data.settings.sapaanPelanggan || "Kak");
            form.setValue("gayaBahasa", data.settings.gayaBahasa || "Formal");
            form.setValue("aturanKhusus", data.settings.aturanKhusus || "");
            
            const basaBasi = data.settings.basaBasi ? JSON.parse(data.settings.basaBasi) : {};
            form.setValue("basaBasi_p", basaBasi["p"] || "");
            form.setValue("basaBasi_halo", basaBasi["halo"] || "");
            form.setValue("basaBasi_terimakasih", basaBasi["terimakasih"] || "");
            form.setValue("basaBasi_ok", basaBasi["ok"] || "");
          }
          if (data.knowledgeBase) {
            form.setValue("knowledgeUrl", data.knowledgeBase.sumber || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const payload = {
        tenantId: TENANT_ID,
        namaUsaha: values.namaUsaha,
        sapaanPelanggan: values.sapaanPelanggan,
        gayaBahasa: values.gayaBahasa,
        aturanKhusus: values.aturanKhusus,
        knowledgeUrl: values.knowledgeUrl,
        basaBasi: {
          "p": values.basaBasi_p,
          "halo": values.basaBasi_halo,
          "terimakasih": values.basaBasi_terimakasih,
          "ok": values.basaBasi_ok,
        }
      };

      const response = await fetch("/api/ai-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage({
          title: "Settings Saved",
          desc: "Your AI chatbot settings have been updated.",
          type: "success"
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      setMessage({
        title: "Error",
        desc: "Failed to save AI settings.",
        type: "error"
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Settings</h2>
      </div>
      
      {message && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <h3 className="font-semibold">{message.title}</h3>
          <p className="text-sm">{message.desc}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5" /> Bot Identity (System Prompt)</CardTitle>
                <CardDescription>Configure how the AI introduces your business and interacts with customers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="namaUsaha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Usaha / Bisnis</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Toko Baju Barokah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sapaanPelanggan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sapaan Pelanggan</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Kak, Bunda, Sis" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gayaBahasa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gaya Bahasa</FormLabel>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="Santai">Santai (Friendly & Casual)</option>
                          <option value="Formal">Formal (Profesional)</option>
                          <option value="Empatik">Empatik (High-empathy Sales)</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aturanKhusus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aturan Khusus / Promo</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Berikan diskon 10% jika pelanggan ragu. Selalu tawarkan pembelian bundling." 
                          className="resize-none h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Instruksi khusus yang wajib diikuti AI dalam berjualan.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Globe className="mr-2 h-5 w-5" /> Knowledge Base (RAG)</CardTitle>
                  <CardDescription>AI will learn from this source to answer product questions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="knowledgeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website or Instagram URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.websiteanda.com/faq" {...field} />
                        </FormControl>
                        <FormDescription>Our system will automatically extract context for the AI from this link.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Sparkles className="mr-2 h-5 w-5" /> Auto-Reply (Zero-Token)</CardTitle>
                  <CardDescription>Instant replies for common words (Bypasses AI API to save cost).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="basaBasi_p" render={({ field }) => (
                    <FormItem className="flex items-center gap-4 space-y-0">
                      <FormLabel className="w-24">"P" / "Ping"</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="basaBasi_halo" render={({ field }) => (
                    <FormItem className="flex items-center gap-4 space-y-0">
                      <FormLabel className="w-24">"Halo"</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="basaBasi_terimakasih" render={({ field }) => (
                    <FormItem className="flex items-center gap-4 space-y-0">
                      <FormLabel className="w-24">"Terima Kasih"</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="basaBasi_ok" render={({ field }) => (
                    <FormItem className="flex items-center gap-4 space-y-0">
                      <FormLabel className="w-24">"Ok"</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Configuration</>}
          </Button>
        </form>
      </Form>
    </div>
  );
}
