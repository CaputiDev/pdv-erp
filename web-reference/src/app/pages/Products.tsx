import { useState } from "react";
import { Plus, Package, AlertTriangle, X } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  criticalStock: number;
}

export default function Products() {
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    barcode: "",
    criticalStock: "5",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      barcode: formData.barcode,
      criticalStock: parseInt(formData.criticalStock),
    };
    setProducts([...products, newProduct]);
    setFormData({ name: "", price: "", stock: "", barcode: "", criticalStock: "5" });
    setShowModal(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h2>Produtos</h2>

      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum produto cadastrado</p>
          </div>
        ) : (
          products.map((product) => {
            const isLowStock = product.stock <= product.criticalStock;

            return (
              <div
                key={product.id}
                className={`bg-card rounded-lg p-4 shadow-sm border ${
                  isLowStock ? "border-destructive bg-destructive/5" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate">{product.name}</h4>
                      {isLowStock && (
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Preço</p>
                        <p className="text-green-600">R$ {product.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Estoque</p>
                        <p className={isLowStock ? "text-destructive" : ""}>
                          {product.stock} qtd
                        </p>
                      </div>
                    </div>

                    {product.barcode && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Código: {product.barcode}
                      </p>
                    )}

                    {isLowStock && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Estoque abaixo do nível crítico</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-primary/10 p-2 rounded-full">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 bg-primary text-primary-foreground p-4 rounded-full shadow-lg active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-card w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3>Novo Produto</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
                  placeholder="Nome do produto"
                />
              </div>

              <div>
                <label className="block mb-2">Preço de Venda *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block mb-2">Estoque Inicial *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block mb-2">Nível Crítico de Estoque *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.criticalStock}
                  onChange={(e) => setFormData({ ...formData, criticalStock: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block mb-2">Código de Barras</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
                  placeholder="000000000000"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg active:scale-95 transition-transform"
              >
                Cadastrar Produto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
