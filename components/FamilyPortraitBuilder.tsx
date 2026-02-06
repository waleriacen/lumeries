'use client';

import { useState } from 'react';

type Person = {
  id: string;
  type: 'adult' | 'child';
  name: string;
  gender: 'male' | 'female';
  skinTone: string;
  hairColor: string;
};

type Pet = {
  id: string;
  type: 'dog' | 'cat' | 'other';
  name: string;
};

export default function FamilyPortraitBuilder() {
  const [people, setPeople] = useState<Person[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [familyName, setFamilyName] = useState('The Smith Family');
  const [theme, setTheme] = useState<'christmas' | 'summer' | 'default'>('christmas');
  const [step, setStep] = useState(1);

  // Add person
  const addPerson = (type: 'adult' | 'child') => {
    const newPerson: Person = {
      id: Date.now().toString(),
      type,
      name: type === 'adult' ? 'Parent' : 'Child',
      gender: 'male',
      skinTone: '#F4C2A0',
      hairColor: '#8B4513',
    };
    setPeople([...people, newPerson]);
  };

  // Remove person
  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  // Update person
  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople(people.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Add pet
  const addPet = (type: 'dog' | 'cat' | 'other') => {
    const newPet: Pet = {
      id: Date.now().toString(),
      type,
      name: type === 'dog' ? 'Buddy' : type === 'cat' ? 'Fluffy' : 'Pet',
    };
    setPets([...pets, newPet]);
  };

  // Remove pet
  const removePet = (id: string) => {
    setPets(pets.filter(p => p.id !== id));
  };

  // Generate preview (simplified for demo)
  const generatePreview = () => {
    return (
      <div className="relative w-full h-96 bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg border-4 border-white shadow-2xl overflow-hidden">
        {/* Background Theme */}
        {theme === 'christmas' && (
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-red-200 to-transparent opacity-30" />
            <div className="text-6xl absolute top-4 left-4">🎄</div>
            <div className="text-6xl absolute top-4 right-4">🎄</div>
            <div className="text-4xl absolute bottom-4 left-8">⛄</div>
            <div className="text-4xl absolute bottom-4 right-8">🎁</div>
          </div>
        )}

        {/* Family Name */}
        <div className="absolute top-6 left-0 right-0 text-center">
          <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'cursive' }}>
            {familyName}
          </h2>
        </div>

        {/* Characters (simplified representation) */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-center items-end gap-4 px-8">
          {people.map((person, index) => (
            <div key={person.id} className="flex flex-col items-center">
              {/* Simplified character */}
              <div
                className="rounded-full mb-2 relative"
                style={{
                  width: person.type === 'adult' ? '80px' : '60px',
                  height: person.type === 'adult' ? '80px' : '60px',
                  backgroundColor: person.skinTone,
                  border: '3px solid #333',
                }}
              >
                {/* Face features */}
                <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-black rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-black rounded-full" />
                <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black rounded-full" />

                {/* Hair */}
                <div
                  className="absolute -top-2 left-0 right-0 h-8 rounded-t-full"
                  style={{ backgroundColor: person.hairColor }}
                />
              </div>

              {/* Body */}
              <div
                className="rounded-lg"
                style={{
                  width: person.type === 'adult' ? '60px' : '45px',
                  height: person.type === 'adult' ? '80px' : '60px',
                  backgroundColor: person.gender === 'male' ? '#4A90E2' : '#E91E63',
                  border: '2px solid #333',
                }}
              />

              {/* Name */}
              <div className="mt-1 text-xs font-semibold text-gray-700">{person.name}</div>
            </div>
          ))}

          {/* Pets */}
          {pets.map((pet) => (
            <div key={pet.id} className="flex flex-col items-center">
              <div className="text-5xl mb-2">
                {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐾'}
              </div>
              <div className="text-xs font-semibold text-gray-700">{pet.name}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {people.length === 0 && pets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <p className="text-lg">Add family members to see preview</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration Panel */}
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  step === s
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Step {s}
              </button>
            ))}
          </div>

          {/* Step 1: Family Members */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">👨‍👩‍👧‍👦 Add Family Members</h3>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => addPerson('adult')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition"
                  >
                    + Add Adult
                  </button>
                  <button
                    onClick={() => addPerson('child')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition"
                  >
                    + Add Child
                  </button>
                </div>

                {/* People List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {people.map((person) => (
                    <div key={person.id} className="bg-gray-50 p-4 rounded-md border">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-semibold text-gray-600">
                          {person.type === 'adult' ? '👤 Adult' : '👶 Child'}
                        </span>
                        <button
                          onClick={() => removePerson(person.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                        placeholder="Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Gender</label>
                          <select
                            value={person.gender}
                            onChange={(e) => updatePerson(person.id, { gender: e.target.value as 'male' | 'female' })}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Skin Tone</label>
                          <input
                            type="color"
                            value={person.skinTone}
                            onChange={(e) => updatePerson(person.id, { skinTone: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Hair Color</label>
                          <input
                            type="color"
                            value={person.hairColor}
                            onChange={(e) => updatePerson(person.id, { hairColor: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pets */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">🐾 Add Pets (Optional)</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => addPet('dog')}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-md transition"
                  >
                    🐕 Dog
                  </button>
                  <button
                    onClick={() => addPet('cat')}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-md transition"
                  >
                    🐈 Cat
                  </button>
                  <button
                    onClick={() => addPet('other')}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition"
                  >
                    🐾 Other
                  </button>
                </div>

                {/* Pets List */}
                <div className="space-y-3">
                  {pets.map((pet) => (
                    <div key={pet.id} className="bg-gray-50 p-4 rounded-md border flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-3xl">
                          {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐾'}
                        </div>
                        <input
                          type="text"
                          value={pet.name}
                          onChange={(e) => setPets(pets.map(p => p.id === pet.id ? { ...p, name: e.target.value } : p))}
                          placeholder="Pet name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <button
                        onClick={() => removePet(pet.id)}
                        className="text-red-500 hover:text-red-700 text-sm ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {pets.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <p>No pets added yet</p>
                      <p className="text-sm">Click above to add pets to your portrait</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Customization */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">🎨 Customize</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Name
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="The Smith Family"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTheme('christmas')}
                      className={`py-3 px-4 rounded-md font-medium transition ${
                        theme === 'christmas'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🎄 Christmas
                    </button>
                    <button
                      onClick={() => setTheme('summer')}
                      className={`py-3 px-4 rounded-md font-medium transition ${
                        theme === 'summer'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ☀️ Summer
                    </button>
                    <button
                      onClick={() => setTheme('default')}
                      className={`py-3 px-4 rounded-md font-medium transition ${
                        theme === 'default'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🏠 Default
                    </button>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md transition text-lg"
                    onClick={() => {
                      // TODO: Generate final high-res version
                      alert('Portrait ready! In full version, this would generate a high-res image for download.');
                    }}
                  >
                    ✨ Generate Portrait
                  </button>

                  <button
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md transition"
                    onClick={() => {
                      // TODO: Add to cart
                      alert('In full version, this would add the portrait to cart for printing on products!');
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="font-semibold text-gray-700 mb-2">Your Portrait</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>👥 {people.length} family member{people.length !== 1 ? 's' : ''}</p>
            <p>🐾 {pets.length} pet{pets.length !== 1 ? 's' : ''}</p>
            <p>🎨 Theme: {theme}</p>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Preview</h3>
        {generatePreview()}

        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>This is a simplified preview. The final portrait will be high-resolution and professionally designed!</p>
        </div>
      </div>
    </div>
  );
}
