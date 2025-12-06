import React, { useState } from 'react';
import { Menu, Product, Company } from '../types';
import { generateProductDescription } from '../services/geminiService';
import { Plus, Trash2, Sparkles, QrCode, Edit2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface MenuBuilderProps {
  menus: Menu[];
  company: Company;
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
  onGenerateQR: (menuId: string) => void;
}

const MenuBuilder: React.FC<MenuBuilderProps> = ({ menus, setMenus, company, onGenerateQR }) => {
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  // Helper to create a new product object
  const createEmptyProduct = (): Product => ({
    id: crypto.randomUUID(),
    name: '',
    price: 0,
    description: '',
  });

  const handleAddMenu = () => {
    if (!newMenuTitle.trim()) return;
    const newMenu: Menu = {
      id: crypto.randomUUID(),
      title: newMenuTitle,
      isActive: true,
      products: [],
    };
    setMenus([...menus, newMenu]);
    setNewMenuTitle('');
    setExpandedMenuId(newMenu.id);
  };

  const handleDeleteMenu = (id: string) => {
    if (confirm('A jeni i sigurt që doni ta fshini këtë menu?')) {
      setMenus(menus.filter((m) => m.id !== id));
    }
  };

  const handleAddProduct = (menuId: string) => {
    setMenus(
      menus.map((m) =>
        m.id === menuId ? { ...m, products: [...m.products, createEmptyProduct()] } : m
      )
    );
  };

  const handleUpdateProduct = (menuId: string, productId: string, field: keyof Product, value: any) => {
    setMenus(
      menus.map((m) =>
        m.id === menuId
          ? {
              ...m,
              products: m.products.map((p) => (p.id === productId ? { ...p, [field]: value } : p)),
            }
          : m
      )
    );
  };

  const handleDeleteProduct = (menuId: string, productId: string) => {
    setMenus(
      menus.map((m) =>
        m.id === menuId
          ? { ...m, products: m.products.filter((p) => p.id !== productId) }
          : m
      )
    );
  };

  const handleAiGenerate = async (menuId: string, productId: string, productName: string) => {
    if (!productName) return;
    setLoadingAiId(productId);
    const description = await generateProductDescription(productName, company.name);
    handleUpdateProduct(menuId, productId, 'description', description);
    setLoadingAiId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedMenuId(expandedMenuId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Create New Menu Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="flex-grow w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Krijo Menu Të Re</label>
          <input
            type="text"
            value={newMenuTitle}
            onChange={(e) => setNewMenuTitle(e.target.value)}
            placeholder="psh. Menu Verore, Menu Pijesh..."
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleAddMenu}
          className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Shto Menu
        </button>
      </div>

      {/* List of Menus */}
      <div className="space-y-4">
        {menus.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Ende nuk keni krijuar asnjë menu. Filloni duke shtuar një më sipër.
          </div>
        )}

        {menus.map((menu) => (
          <div key={menu.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Menu Header */}
            <div
              className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleExpand(menu.id)}
            >
              <div className="flex items-center gap-3">
                {expandedMenuId === menu.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-800">{menu.title}</h3>
                <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  {menu.products.length} Produkte
                </span>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onGenerateQR(menu.id)}
                  className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Gjenero QR Kod"
                >
                  <QrCode className="w-5 h-5" />
                  <span className="hidden sm:inline">QR Kod</span>
                </button>
                <button
                  onClick={() => handleDeleteMenu(menu.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Fshij Menu"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Menu Body (Products) */}
            {expandedMenuId === menu.id && (
              <div className="p-4 border-t border-gray-100 animate-fadeIn">
                <div className="space-y-4">
                  {menu.products.map((product, index) => (
                    <div key={product.id} className="flex flex-col md:flex-row gap-4 items-start border p-4 rounded-lg bg-white relative group">
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => handleDeleteProduct(menu.id, product.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                         >
                            <Trash2 className="w-4 h-4"/>
                         </button>
                       </div>
                       
                      <div className="flex-1 w-full space-y-3">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Emri i Produktit</label>
                                <input
                                type="text"
                                value={product.name}
                                onChange={(e) => handleUpdateProduct(menu.id, product.id, 'name', e.target.value)}
                                className="w-full font-medium border-b border-gray-200 focus:border-indigo-500 focus:outline-none py-1"
                                placeholder="psh. Pizza Margarita"
                                />
                            </div>
                            <div className="w-32">
                                <label className="text-xs text-gray-500">Çmimi ({company.currency})</label>
                                <input
                                type="number"
                                value={product.price}
                                onChange={(e) => handleUpdateProduct(menu.id, product.id, 'price', parseFloat(e.target.value))}
                                className="w-full font-medium border-b border-gray-200 focus:border-indigo-500 focus:outline-none py-1"
                                placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 flex items-center justify-between">
                                <span>Përshkrimi</span>
                                <button
                                    onClick={() => handleAiGenerate(menu.id, product.id, product.name)}
                                    disabled={loadingAiId === product.id || !product.name}
                                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${
                                        loadingAiId === product.id 
                                        ? 'bg-gray-100 text-gray-400' 
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    {loadingAiId === product.id ? 'Duke shkruar...' : 'Gjenero me AI'}
                                </button>
                            </label>
                            <textarea
                                value={product.description}
                                onChange={(e) => handleUpdateProduct(menu.id, product.id, 'description', e.target.value)}
                                className="w-full text-sm text-gray-600 border border-gray-200 rounded-md p-2 mt-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                rows={2}
                                placeholder="Përshkrimi i detajuar i përbërësve..."
                            />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddProduct(menu.id)}
                  className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Shto Produkt
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBuilder;