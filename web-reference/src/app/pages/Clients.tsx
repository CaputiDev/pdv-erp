import { useState } from "react";
import { Plus, Search, User, Phone, Mail, MapPin, X } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export default function Clients() {
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Date.now().toString(),
      ...formData,
    };
    setClients([...clients, newClient]);
    setFormData({ name: "", phone: "", email: "", address: "" });
    setShowModal(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h2>Clientes</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-input-background rounded-lg border border-border"
        />
      </div>

      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-card rounded-lg p-4 shadow-sm border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate">{client.name}</h4>
                  <div className="space-y-1 mt-2">
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
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
              <h3>Novo Cliente</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block mb-2">Endereço</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border resize-none"
                  rows={3}
                  placeholder="Endereço completo"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg active:scale-95 transition-transform"
              >
                Cadastrar Cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
