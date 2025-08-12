import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Code, Upload, ExternalLink } from "lucide-react";

const FlipbookTest = () => {
  const [embedCode, setEmbedCode] = useState("");
  const [showEmbed, setShowEmbed] = useState(false);

  const sampleHeyzineEmbed = `<iframe allowfullscreen="true" scrolling="no" class="fp-iframe" style="border: 1px solid lightgray; width: 100%; height: 500px;" src="https://heyzine.com/flip-book/your-flipbook-id.html"></iframe>`;

  const alternatives = [
    {
      name: "Heyzine",
      description: "Easy-to-use online flipbook creator with embed codes",
      pros: ["Free tier available", "Simple embed process", "Mobile responsive"],
      website: "https://heyzine.com"
    },
    {
      name: "FlipHTML5",
      description: "Professional flipbook platform with advanced features",
      pros: ["Rich customization", "Analytics", "Interactive elements"],
      website: "https://fliphtml5.com"
    },
    {
      name: "Turn.js",
      description: "JavaScript library for creating flipbook animations",
      pros: ["Self-hosted", "Customizable", "No external dependencies"],
      website: "http://turnjs.com"
    },
    {
      name: "PDF.js + Custom Animation",
      description: "Mozilla's PDF.js with custom flipbook animations",
      pros: ["Open source", "Full control", "No external service needed"],
      website: "https://mozilla.github.io/pdf.js/"
    }
  ];

  const handleEmbedTest = () => {
    if (embedCode.trim()) {
      setShowEmbed(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Flipbook Test Page</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test and embed interactive flipbooks from various platforms
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Embed Testing Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Test Embed Code
              </CardTitle>
              <CardDescription>
                Paste your flipbook embed code here to test it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Embed Code (iframe or other HTML)
                </label>
                <Textarea
                  placeholder="Paste your embed code here..."
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  className="min-h-32"
                />
              </div>
              
              <div className="flex gap-4">
                <Button onClick={handleEmbedTest} disabled={!embedCode.trim()}>
                  Test Embed
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEmbedCode(sampleHeyzineEmbed)}
                >
                  Use Sample Code
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEmbedCode("");
                    setShowEmbed(false);
                  }}
                >
                  Clear
                </Button>
              </div>

              {showEmbed && embedCode && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Embedded Flipbook:</h3>
                  <div 
                    className="border border-muted-foreground/20 rounded-lg p-4 bg-muted/50"
                    dangerouslySetInnerHTML={{ __html: embedCode }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Alternatives Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Flipbook Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Various platforms and libraries for creating interactive flipbooks from PDFs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {alternatives.map((solution, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{solution.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {solution.description}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={solution.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {solution.pros.map((pro, proIndex) => (
                      <Badge key={proIndex} variant="outline" className="rounded-none">
                        {pro}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Instructions Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                How to Use Heyzine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Step-by-step process:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Go to <a href="https://heyzine.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">heyzine.com</a></li>
                  <li>Upload your PDF file</li>
                  <li>Customize the flipbook settings (optional)</li>
                  <li>Publish your flipbook</li>
                  <li>Copy the embed code provided</li>
                  <li>Paste the embed code in the test area above</li>
                </ol>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Sample Heyzine Embed Code:</h4>
                <code className="text-sm text-muted-foreground break-all">
                  {sampleHeyzineEmbed}
                </code>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recommendations */}
        <section className="text-center bg-muted rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Recommendation</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            For quick implementation, <strong>Heyzine</strong> is the easiest option with a free tier. 
            For more control and customization, consider <strong>Turn.js</strong> or building a custom solution with <strong>PDF.js</strong>.
          </p>
          <div className="flex flex-col gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="https://heyzine.com" target="_blank" rel="noopener noreferrer">
                Try Heyzine Free
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="http://turnjs.com" target="_blank" rel="noopener noreferrer">
                Explore Turn.js
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FlipbookTest;