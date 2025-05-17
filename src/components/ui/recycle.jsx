

const recyle =()=>{
    const centers = [
        { name: "Banjul Recycling Hub", address: "23 Independence Drive, Banjul", hours: "Mon-Sat: 8AM-6PM", materials: ["Plastic", "Glass", "Paper"] },
        { name: "Serrekunda Eco Center", address: "45 Kairaba Avenue", hours: "Daily: 7AM-8PM", materials: ["Electronics", "Metal", "Batteries"] }
      ];
    return(
        <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-green-700 mb-8">Recycling Centers</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {centers.map((center, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{center.name}</h2>
              <p className="text-gray-600 mb-2">{center.address}</p>
              <p className="text-green-600 font-medium mb-4">{center.hours}</p>
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Accepted Materials:</h3>
                <div className="flex flex-wrap gap-2">
                  {center.materials.map((material, i) => (
                    <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    )
}