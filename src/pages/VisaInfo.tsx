import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import heroVisaInfo from "@/assets/hero-visa-info.jpg";
import flagUS from "@/assets/flag-us.jpg";
import flagUK from "@/assets/flag-uk.jpg";
import flagCanada from "@/assets/flag-canada.jpg";
import flagAustralia from "@/assets/flag-australia.jpg";
import flagGermany from "@/assets/flag-germany.jpg";
import flagJapan from "@/assets/flag-japan.jpg";
import flagFrance from "@/assets/flag-france.jpg";
import flagBrazil from "@/assets/flag-brazil.jpg";
const VisaInfo = () => {
  const visaRequirements = [{
    country: "United States",
    flag: flagUS,
    summary: "Most visitors need a valid passport and either an ESTA (for eligible countries) or a visa. ESTA allows stays up to 90 days for tourism or business.",
    website: "https://travel.state.gov/content/travel/en/us-visas.html",
    requirements: ["Valid passport (6+ months validity recommended)", "ESTA authorization or appropriate visa", "Return/onward ticket", "Proof of sufficient funds"]
  }, {
    country: "United Kingdom",
    flag: flagUK,
    summary: "Visitors from many countries can enter visa-free for up to 6 months. EU citizens need valid passport. Others may require visitor visa.",
    website: "https://www.gov.uk/check-uk-visa",
    requirements: ["Valid passport", "Proof of accommodation", "Return ticket", "Evidence of sufficient funds"]
  }, {
    country: "Canada",
    flag: flagCanada,
    summary: "Most visitors need either an eTA (electronic Travel Authorization) or a visitor visa, plus a valid passport.",
    website: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
    requirements: ["Valid passport", "eTA or visitor visa", "Proof of ties to home country", "Sufficient funds for stay"]
  }, {
    country: "Australia",
    flag: flagAustralia,
    summary: "All visitors need a valid visa and passport. Tourist visas allow stays from 3-12 months depending on visa type.",
    website: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder",
    requirements: ["Valid passport (6+ months validity)", "Appropriate visa (tourist, business, etc.)", "Health insurance recommended", "Proof of sufficient funds"]
  }, {
    country: "Germany",
    flag: flagGermany,
    summary: "EU citizens need valid ID. Others may enter visa-free for up to 90 days (Schengen rules) or require Schengen visa.",
    website: "https://www.germany.travel/en/ms/german-visa/german-visa.html",
    requirements: ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance (€30,000 minimum)", "Proof of accommodation and funds"]
  }, {
    country: "Japan",
    flag: flagJapan,
    summary: "Many countries can enter visa-free for tourism (15-90 days). Others need tourist visa. Passport required for all visitors.",
    website: "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    requirements: ["Valid passport", "Tourist visa (if required)", "Return/onward ticket", "Proof of sufficient funds"]
  }, {
    country: "France",
    flag: flagFrance,
    summary: "EU citizens need valid ID. Non-EU visitors can stay up to 90 days visa-free (if eligible) or need Schengen visa.",
    website: "https://france-visas.gouv.fr/en",
    requirements: ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Proof of accommodation and funds"]
  }, {
    country: "Brazil",
    flag: flagBrazil,
    summary: "Many countries can enter visa-free for tourism up to 90 days. Others require tourist visa. Yellow fever vaccination may be required.",
    website: "https://www.gov.br/mre/en/consular-services/visas",
    requirements: ["Valid passport (6+ months validity)", "Tourist visa (if required)", "Yellow fever vaccination (from certain countries)", "Proof of sufficient funds"]
  }];
  return <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 bg-background">
        <Navigation />
      </div>
      
      {/* Hero Section */}
      <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden border-8 border-white rounded-none shadow-[0_8px_12px_-4px_rgba(169,169,169,0.4),_-6px_8px_12px_-4px_rgba(169,169,169,0.3),_6px_8px_12px_-4px_rgba(169,169,169,0.3)] bg-background">
        <img src={heroVisaInfo} alt="Visa Information Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white text-center px-4">
            VISA INFO
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 space-y-6 sm:space-y-8 bg-background">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="shadow-gray-400 bg-white rounded h-12 touch-target px-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Back to Home</span>
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4 px-2">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Visa Requirements by Country
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Essential visa information for popular travel destinations
          </p>
          <div className="bg-red-600 border border-red-600 rounded-lg p-4 sm:p-6 mt-6">
            <p className="text-sm sm:text-base text-white leading-relaxed">
              <strong>Important:</strong> Visa requirements can change frequently. Always verify current requirements with official government sources before traveling.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {visaRequirements.map((country, index) => <Card key={index} className="border-2">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <img src={country.flag} alt={`${country.country} flag`} className="w-8 h-6 object-cover rounded border flex-shrink-0" />
                    <CardTitle className="text-lg sm:text-xl font-bold text-primary">
                      {country.country}
                    </CardTitle>
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-10 touch-target w-full sm:w-auto">
                    <a href={country.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <span className="text-sm">Official Site</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {country.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div>
                  <h4 className="font-semibold mb-3 text-primary text-base sm:text-lg">Key Requirements:</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {country.requirements.map((requirement, reqIndex) => <li key={reqIndex} className="flex items-start gap-3">
                        <span className="text-primary font-bold text-lg flex-shrink-0">•</span>
                        <span className="text-sm sm:text-base leading-relaxed">{requirement}</span>
                      </li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>)}
        </div>

        <div className="text-center space-y-4 bg-background border border-border rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Need More Information?
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Contact the embassy or consulate of your destination country for the most up-to-date visa requirements and application procedures.
          </p>
        </div>
      </div>

      <Footer />
    </div>;
};
export default VisaInfo;