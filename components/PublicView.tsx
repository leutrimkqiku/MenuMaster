import React, { useState, useMemo } from 'react';
import { Menu, Company, Product } from '../types';
import { ShoppingBag, Phone, MapPin, BellRing, Info, ChevronLeft, X, ChefHat, Star, Clock } from 'lucide-react';

interface PublicViewProps {
  menu: Menu;
  company: Company;
}

const PublicView: React.FC<PublicViewProps> = ({ menu, company }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Të gjitha');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(menu.products.map(p => p.category?.trim() || 'Të Tjera'));
    // If no categories are defined at all, don't show tabs unless needed
    const uniqueCats = Array.from(cats).filter(c => c !== '');
    return ['Të gjitha', ...uniqueCats.sort()];
  }, [menu.products]);

  // Filter products based on active category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Të gjitha') return menu.products;
    return menu.products.filter(p => (p.category?.trim() || 'Të Tjera') === activeCategory);
  }, [activeCategory, menu.products]);

  // Handle "New Page" feel
  if (selectedProduct) {
    return (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fadeIn">
            <div className="relative">
                {/* Back Button */}
                <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg text-gray-800 hover:bg-white transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Product Image Placeholder */}
                <div className="h-72 w-full bg-gray-100 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0"></div>
                     <img 
                        src={`https://source.unsplash.com/800x600/?food,${selectedProduct.name.split(' ')[0]}`} 
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
                        }}
                     />
                     <div className="absolute bottom-0 left-0 p-6 z-10 text-white w-full">
                         <span className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                             {selectedProduct.category || 'Specialitet'}
                         </span>
                         <h1 className="text-3xl font-bold leading-tight">{selectedProduct.name}</h1>
                     </div>
                </div>

                {/* Details Body */}
                <div className="px-6 py-8 -mt-6 bg-white rounded-t-[2rem] relative z-10 min-h-[50vh]">
                    
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <Star className="w-5 h-5 fill-current" />
                            <span>4.8</span>
                            <span className="text-gray-400 text-sm font-normal">(120 review)</span>
                        </div>
                        <div className="text-3xl font-bold text-indigo-600">
                            {selectedProduct.price} <span className="text-lg font-medium text-gray-500">{company.currency}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-gray-900 font-bold text-lg mb-2">Përshkrimi</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {selectedProduct.description || "Një zgjedhje e shkëlqyer nga kuzhina jonë. Përbërës të freskët dhe shije autentike që do t'ju mbetet në mendje."}
                            </p>
                        </div>

                        {/* Additional Info Mockup */}
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-orange-500" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">Koha</p>
                                    <p className="font-bold text-gray-800">15-20 min</p>
                                </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                                <ChefHat className="w-6 h-6 text-green-500" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">Kuzhina</p>
                                    <p className="font-bold text-gray-800">Autentike</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => alert("Funksionaliteti i porositjes do të shtohet së shpejti!")}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-2 mt-8"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Shto në Porosi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- Main List View ---
  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      {/* Hero Header */}
      <div className="relative bg-gray-900 text-white overflow-hidden rounded-b-[2.5rem] shadow-2xl h-72">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
        
        <div className="relative z-10 px-6 h-full flex flex-col justify-end pb-12">
            <div className="inline-block bg-indigo-600/90 backdrop-blur text-white px-4 py-1.5 rounded-full font-semibold text-xs uppercase tracking-wider w-fit mb-3">
                {menu.title}
            </div>
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight leading-tight">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200">
                <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-indigo-400"/> {company.address || 'Lokacioni'}
                </span>
                {company.phone && (
                     <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-indigo-400"/> {company.phone}
                    </span>
                )}
            </div>
        </div>
      </div>

      {/* Category Navigation (Sticky) */}
      {categories.length > 2 && (
          <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md py-4 pl-4 border-b border-gray-200/50 shadow-sm overflow-x-auto no-scrollbar">
            <div className="flex gap-2 pr-4 min-w-max">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                            activeCategory === cat 
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-105' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>
      )}

      {/* Product Grid */}
      <div className="max-w-xl mx-auto px-4 mt-6 space-y-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            onClick={() => setSelectedProduct(product)}
            className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
          >
              {/* Product Thumbnail (Dynamic Placeholder) */}
              <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                 <img 
                    src={`https://source.unsplash.com/200x200/?food,${product.category || 'meal'},${product.id}`} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200';
                    }}
                 />
              </div>

              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight truncate pr-2">{product.name}</h3>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                    {product.description || "Kliko për të parë detajet dhe përbërësit e këtij produkti."}
                  </p>
                  <div className="flex items-center justify-between">
                     <span className="font-bold text-indigo-600 text-lg">
                        {product.price} <span className="text-xs text-gray-400 font-normal">{company.currency}</span>
                     </span>
                     <span className="bg-gray-100 text-gray-600 p-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                     </span>
                  </div>
              </div>
          </div>
        ))}
        
        {filteredProducts.length === 0 && (
            <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100 mt-8">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                <p className="text-gray-500 font-medium">Nuk u gjetën produkte në këtë kategori.</p>
                <button 
                    onClick={() => setActiveCategory('Të gjitha')}
                    className="mt-4 text-indigo-600 font-medium hover:underline text-sm"
                >
                    Shiko të gjitha
                </button>
            </div>
        )}
      </div>

      {/* Floating Action Bar (Call Waiter) */}
      <div className="fixed bottom-6 left-0 w-full px-4 z-40 pointer-events-none">
          <div className="max-w-xl mx-auto pointer-events-auto">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2 flex items-center justify-between gap-3">
                <button 
                    onClick={() => alert("Kamarieri po vjen!")}
                    className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-black"
                >
                    <BellRing className="w-4 h-4" />
                    Thirr Kamarierin
                </button>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="px-3 text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest leading-tight">
                    Powered<br/>By AI
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default PublicView;