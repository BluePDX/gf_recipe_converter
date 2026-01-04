import { useState } from 'react';
import { Upload, Link, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function RecipeConverter() {
  const [inputMode, setInputMode] = useState('text');
  const [recipeInput, setRecipeInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [convertedRecipe, setConvertedRecipe] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setError(null);
    }
  };

  const convertRecipe = async () => {
    setLoading(true);
    setError(null);
    setConvertedRecipe(null);

    try {
      let imageData = null;

      if (inputMode === 'image' && imageFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageData = {
          type: imageFile.type,
          data: base64
        };
      }

      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeText: recipeInput,
          inputMode,
          imageData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      setConvertedRecipe(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = () => {
    if (loading) return true;
    if (inputMode === 'image') return !imageFile;
    return !recipeInput.trim();
  };

  const getFeasibilityColor = (level) => {
    const colors = {
      'easy': 'text-green-600 bg-green-50',
      'moderate': 'text-yellow-700 bg-yellow-50',
      'difficult': 'text-orange-600 bg-orange-50',
      'not-recommended': 'text-red-600 bg-red-50'
    };
    return colors[level] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Gluten-Free Recipe Converter
          </h1>
          <p className="text-gray-600">
            Smart conversions for celiac & Hashimoto's disease
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
            <button
              onClick={() => {
                setInputMode('text');
                setImageFile(null);
                setError(null);
              }}
              className={`py-3 px-2 md:px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm md:text-base ${
                inputMode === 'text'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Paste Recipe</span>
              <span className="sm:hidden">Paste</span>
            </button>
            <button
              onClick={() => {
                setInputMode('url');
                setImageFile(null);
                setError(null);
              }}
              className={`py-3 px-2 md:px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm md:text-base ${
                inputMode === 'url'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Link className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">From URL</span>
              <span className="sm:hidden">URL</span>
            </button>
            <button
              onClick={() => {
                setInputMode('image');
                setRecipeInput('');
                setError(null);
              }}
              className={`py-3 px-2 md:px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm md:text-base ${
                inputMode === 'image'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Upload Image</span>
              <span className="sm:hidden">Image</span>
            </button>
          </div>

          {/* Input Area */}
          {inputMode === 'text' && (
            <textarea
              value={recipeInput}
              onChange={(e) => setRecipeInput(e.target.value)}
              placeholder="Paste your recipe here (ingredients and instructions)..."
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
            />
          )}

          {inputMode === 'url' && (
            <input
              type="url"
              value={recipeInput}
              onChange={(e) => setRecipeInput(e.target.value)}
              placeholder="https://example.com/recipe"
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          )}

          {inputMode === 'image' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">
                  {imageFile ? imageFile.name : 'Click to upload recipe image'}
                </p>
              </label>
            </div>
          )}

          <button
            onClick={convertRecipe}
            disabled={isDisabled()}
            className="w-full mt-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Converting...' : 'Convert to Gluten-Free'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {convertedRecipe && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {convertedRecipe.recipeTitle}
            </h2>
            <p className="text-gray-600 mb-4">{convertedRecipe.recipeType}</p>

            {/* Feasibility Badge */}
            <div className={`flex items-start gap-3 mb-6 p-4 rounded-lg ${getFeasibilityColor(convertedRecipe.feasibility)}`}>
              <span className="flex-shrink-0 mt-0.5">
                {['easy', 'moderate'].includes(convertedRecipe.feasibility) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </span>
              <div className="flex-1">
                <div className="font-semibold uppercase text-sm mb-1">
                  {convertedRecipe.feasibility}
                </div>
                <p className="text-sm">{convertedRecipe.feasibilityNote}</p>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Ingredients
              </h3>
              <div className="space-y-2">
                {convertedRecipe.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      ing.hasSwap ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                    }`}
                  >
                    {ing.hasSwap ? (
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="text-gray-500 line-through text-sm md:text-base">
                          {ing.original}
                        </div>
                        <div className="text-gray-900 font-medium text-sm md:text-base">
                          → {ing.substitution}
                          {ing.footnote && (
                            <span className="text-orange-500 ml-1">{ing.footnote}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700 text-sm md:text-base">
                        {ing.original} <span className="text-gray-500 italic">(no swap needed)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Swap Options */}
            {convertedRecipe.swapOptions?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  Ingredient Options & Texture Guide
                </h3>
                {convertedRecipe.swapOptions.map((swap, idx) => (
                  <div key={idx} className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      {swap.ingredient}
                    </h4>
                    <div className="space-y-3">
                      {swap.options.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <div className="font-semibold text-gray-900 mb-1">
                            {option.name}
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            {option.substitution}
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Texture:</span> {option.texture}
                            </div>
                            <div>
                              <span className="font-medium">Best for:</span> {option.bestFor}
                            </div>
                          </div>
                          {option.notes && (
                            <div className="mt-2 text-sm text-gray-600 italic">
                              {option.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Instructions
              </h3>
              <ol className="space-y-3">
                {convertedRecipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3 md:gap-4">
                    <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 pt-1 text-sm md:text-base">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Notes */}
            {convertedRecipe.notes && Object.keys(convertedRecipe.notes).length > 0 && (
              <div className="mb-8 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Notes</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(convertedRecipe.notes).map(([marker, note]) => (
                    <div key={marker} className="text-sm md:text-base">
                      <span className="font-semibold text-orange-500">{marker}</span>
                      <span className="text-gray-700"> {note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Recommendations */}
            {convertedRecipe.brandRecommendations?.length > 0 && (
              <div className="mb-8 p-4 md:p-6 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                  Gluten-Free Brand Recommendations
                </h3>
                <div className="space-y-4">
                  {convertedRecipe.brandRecommendations.map((rec, idx) => (
                    <div key={idx}>
                      <div className="font-semibold text-gray-800 mb-2">
                        {rec.category}:
                      </div>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {rec.brands.map((brand, brandIdx) => (
                          <li key={brandIdx} className="text-sm md:text-base text-gray-700">
                            {brand}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Tips */}
            {convertedRecipe.additionalTips && (
              <div className="p-4 md:p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Additional Tips
                </h3>
                <p className="text-sm md:text-base text-gray-700">
                  {convertedRecipe.additionalTips}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
