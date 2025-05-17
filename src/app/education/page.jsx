import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export default function EducationPage(){
    const learningResources = [
        {
          title: "Why Recycling Matters in The Gambia",
          content: [
            "♻️ 40% of Banjul's waste could be recycled (Gambia Bureau of Statistics, 2023)",
            "🌍 Plastic pollution affects 85% of Gambian coastline (NEA Report, 2022)",
            "💰 Recycling creates local jobs - 1,200+ employed in waste sector"
          ],
          tips: [
            "Separate waste at source",
            "Clean containers before recycling",
            "Support local recycling initiatives"
          ]
        },
        {
          title: "How to Recycle Properly",
          content: [
            "Plastic: Clean and sort by type (PET, HDPE)",
            "Metal: Remove food residues",
            "Paper: Keep dry and bundle together",
            "Glass: Separate by color"
          ],
          tips: [
            "Use community collection points",
            "Check recycling symbols",
            "Compact items to save space"
          ]
        },
        {
          title: "Composting Guide",
          content: [
            "✅ Do compost: Food scraps, yard waste",
            "❌ Don't compost: Meat, dairy, oils",
            "Ideal compost mix: 2 parts brown to 1 part green"
          ],
          tips: [
            "Turn pile weekly",
            "Maintain moisture",
            "Use in home gardens"
          ]
        }
      ];
    return(
        <>
        <Navbar/>
        
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-green-700 mb-8">Waste Education Hub</h1>
        
        <div className="bg-green-700 text-white p-8 rounded-lg mb-12">
          <h2 className="text-2xl font-bold mb-4">Did You Know? </h2>
          <p className="text-lg">
            Proper waste management could create 5,000+ jobs in The Gambia by 2030 
            (National Development Plan 2023-2027)
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {learningResources.map((section, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{section.title}</h2>
              
              <div className="space-y-3 mb-6">
                {section.content.map((item, i) => (
                  <p key={i} className="text-gray-600 flex items-start">
                    <span className="mr-2">•</span>{item}
                  </p>
                ))}
              </div>

              {section.tips && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-3">Action Steps:</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="text-green-700">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recycling Benefits</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded">
              <div className="text-green-600 font-bold text-2xl mb-2">30%</div>
              <div className="text-gray-600">Reduction in landfill waste</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-green-600 font-bold text-2xl mb-2">50%</div>
              <div className="text-gray-600">Energy savings through recycling</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-green-600 font-bold text-2xl mb-2">75%</div>
              <div className="text-gray-600">Reduced marine pollution potential</div>
            </div>
          </div>
        </div>
      </div>
    </div>
        <Footer/>
        </>
    )


}