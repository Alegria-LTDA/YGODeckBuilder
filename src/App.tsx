import React, { useState } from 'react';
import { Plus, Save, Trash2, Search, X } from 'lucide-react';

interface Card {
  id: string;
  name: string;
  type: string;
  quantity: number;
  imageUrl?: string;
  apiData?: any;
}

interface ApiCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  card_images: Array<{ image_url: string }>;
}

function App() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [newCard, setNewCard] = useState({
    name: '',
    type: 'monstro',
    quantity: 1
  });
  const [searchResults, setSearchResults] = useState<ApiCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ApiCard | null>(null);

  const searchCards = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?language=pt&fname=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar cartas:', error);
      setSearchResults([]);
    }
  };

  const addCard = (apiCard?: ApiCard) => {
    if (!apiCard && !newCard.name) return;

    const cardToAdd = apiCard ? {
      name: apiCard.name,
      type: apiCard.type.toLowerCase().includes('monster') ? 'monstro' :
            apiCard.type.toLowerCase().includes('spell') ? 'magia' :
            apiCard.type.toLowerCase().includes('trap') ? 'armadilha' : 'extra',
      imageUrl: apiCard.card_images[0].image_url,
      apiData: apiCard
    } : newCard;

    const existingCard = deck.find(card => card.name.toLowerCase() === cardToAdd.name.toLowerCase());
    
    if (existingCard) {
      if (existingCard.quantity >= 3) {
        alert('Você já possui o máximo de 3 cópias desta carta!');
        return;
      }
      setDeck(deck.map(card => 
        card.name.toLowerCase() === cardToAdd.name.toLowerCase()
          ? { ...card, quantity: Math.min(card.quantity + 1, 3) }
          : card
      ));
    } else {
      setDeck([...deck, { ...cardToAdd, id: Date.now().toString(), quantity: 1 }]);
    }
    
    setNewCard({ name: '', type: 'monstro', quantity: 1 });
    setSearchResults([]);
    setIsSearching(false);
  };

  const removeCard = (id: string) => {
    setDeck(deck.filter(card => card.id !== id));
  };

  const saveDeck = () => {
    const deckData = JSON.stringify(deck);
    const blob = new Blob([deckData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meu-deck-yugioh.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCardDescription = (desc: string) => {
    if (desc.includes('[ Pendulum Effect ]')) {
      const [_, rest] = desc.split('[ Pendulum Effect ]');
      const [pendulumEffect, monsterEffect] = rest.split('[ Monster Effect ]');
      return {
        pendulumEffect: pendulumEffect.trim(),
        monsterEffect: monsterEffect ? monsterEffect.trim() : ''
      };
    }
    return {
      pendulumEffect: '',
      monsterEffect: desc
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Criador de Deck Yu-Gi-Oh!</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newCard.name}
                    onChange={(e) => {
                      setNewCard({ ...newCard, name: e.target.value });
                      searchCards(e.target.value);
                      setIsSearching(true);
                    }}
                    onFocus={() => setIsSearching(true)}
                    placeholder="Buscar carta..."
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
                  />
                  {isSearching && (
                    <div className="absolute w-full mt-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center p-2 border-b border-gray-600">
                        <span className="text-sm text-gray-300">Resultados da busca</span>
                        <button
                          onClick={() => {
                            setIsSearching(false);
                            setSearchResults([]);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {searchResults.map(card => (
                        <div
                          key={card.id}
                          className="p-2 hover:bg-gray-600 cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            addCard(card);
                            setSelectedCard(card);
                          }}
                          onMouseEnter={() => setSelectedCard(card)}
                        >
                          <img
                            src={card.card_images[0].image_url}
                            alt={card.name}
                            className="w-10 h-14 object-cover rounded"
                          />
                          <span>{card.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  value={newCard.type}
                  onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                  className="px-4 py-2 rounded bg-gray-700 text-white"
                >
                  <option value="monstro">Monstro</option>
                  <option value="magia">Magia</option>
                  <option value="armadilha">Armadilha</option>
                  <option value="extra">Deck Extra</option>
                </select>
                <button
                  onClick={() => addCard()}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded flex items-center gap-2"
                >
                  <Plus size={20} />
                  Adicionar
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Seu Deck ({deck.reduce((acc, card) => acc + card.quantity, 0)} cartas)</h2>
                <button
                  onClick={saveDeck}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2"
                >
                  <Save size={20} />
                  Salvar Deck
                </button>
              </div>

              <div className="space-y-4">
                {['monstro', 'magia', 'armadilha', 'extra'].map(type => (
                  <div key={type} className="border-b border-gray-700 pb-4">
                    <h3 className="text-xl font-semibold capitalize mb-3">
                      Cartas de {type} ({deck.filter(card => card.type === type).reduce((acc, card) => acc + card.quantity, 0)})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deck
                        .filter(card => card.type === type)
                        .map(card => (
                          <div
                            key={card.id}
                            className="bg-gray-700 rounded-lg overflow-hidden flex cursor-pointer hover:bg-gray-600 transition-colors"
                            onClick={() => setSelectedCard(card.apiData)}
                            onMouseEnter={() => setSelectedCard(card.apiData)}
                          >
                            {card.imageUrl && (
                              <img
                                src={card.imageUrl}
                                alt={card.name}
                                className="w-24 h-36 object-cover"
                              />
                            )}
                            <div className="flex-1 p-3 flex flex-col justify-between">
                              <div>
                                <h4 className="font-semibold">{card.name}</h4>
                                <p className="text-sm text-gray-300">Quantidade: {card.quantity}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCard(card.id);
                                }}
                                className="text-red-400 hover:text-red-300 self-end"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            {selectedCard && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{selectedCard.name}</h3>
                <img
                  src={selectedCard.card_images[0].image_url}
                  alt={selectedCard.name}
                  className="w-full max-w-[300px] mx-auto mb-4 rounded-lg"
                />
                {selectedCard.type.toLowerCase().includes('monster') && (
                  <div className="mb-4 flex justify-center gap-8 text-sm">
                    <span className="text-orange-400">ATK: {selectedCard.atk || '?'}</span>
                    <span className="text-blue-400">DEF: {selectedCard.def || '?'}</span>
                  </div>
                )}
                <div className="space-y-4">
                  {selectedCard.desc.includes('[ Pendulum Effect ]') && (
                    <>
                      <div>
                        <h4 className="text-yellow-400 font-semibold mb-2">Efeito Pêndulo</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {formatCardDescription(selectedCard.desc).pendulumEffect}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-blue-400 font-semibold mb-2">Efeito de Monstro</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {formatCardDescription(selectedCard.desc).monsterEffect}
                        </p>
                      </div>
                    </>
                  )}
                  {!selectedCard.desc.includes('[ Pendulum Effect ]') && (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedCard.desc}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;