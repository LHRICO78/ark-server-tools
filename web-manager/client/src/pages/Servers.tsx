import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Play, Square, RotateCw, Plus, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";

export default function Servers() {
  const utils = trpc.useUtils();
  const { data: servers, isLoading } = trpc.servers.list.useQuery();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newServer, setNewServer] = useState({
    name: "",
    instanceName: "",
    serverMap: "TheIsland",
    maxPlayers: "70",
    serverPort: "7777",
    queryPort: "27015",
    rconPort: "32330",
    rconPassword: "",
  });

  const createServerMutation = trpc.servers.create.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate();
      setIsCreateDialogOpen(false);
      setNewServer({
        name: "",
        instanceName: "",
        serverMap: "TheIsland",
        maxPlayers: "70",
        serverPort: "7777",
        queryPort: "27015",
        rconPort: "32330",
        rconPassword: "",
      });
      toast.success("Serveur créé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la création du serveur: " + error.message);
    },
  });

  const startServerMutation = trpc.servers.start.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate();
      toast.success("Serveur démarré");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const stopServerMutation = trpc.servers.stop.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate();
      toast.success("Serveur arrêté");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const restartServerMutation = trpc.servers.restart.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate();
      toast.success("Serveur redémarré");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const deleteServerMutation = trpc.servers.delete.useMutation({
    onSuccess: () => {
      utils.servers.list.invalidate();
      toast.success("Serveur supprimé");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const handleCreateServer = () => {
    createServerMutation.mutate(newServer);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Serveurs</h1>
            <p className="text-gray-500 mt-1">
              Gérez vos instances de serveur ARK
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau serveur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau serveur</DialogTitle>
                <DialogDescription>
                  Configurez les paramètres de votre nouveau serveur ARK
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du serveur</Label>
                    <Input
                      id="name"
                      value={newServer.name}
                      onChange={(e) =>
                        setNewServer({ ...newServer, name: e.target.value })
                      }
                      placeholder="Mon serveur ARK"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instanceName">Nom d'instance</Label>
                    <Input
                      id="instanceName"
                      value={newServer.instanceName}
                      onChange={(e) =>
                        setNewServer({
                          ...newServer,
                          instanceName: e.target.value,
                        })
                      }
                      placeholder="main"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serverMap">Carte</Label>
                    <Input
                      id="serverMap"
                      value={newServer.serverMap}
                      onChange={(e) =>
                        setNewServer({ ...newServer, serverMap: e.target.value })
                      }
                      placeholder="TheIsland"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers">Joueurs max</Label>
                    <Input
                      id="maxPlayers"
                      value={newServer.maxPlayers}
                      onChange={(e) =>
                        setNewServer({ ...newServer, maxPlayers: e.target.value })
                      }
                      placeholder="70"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serverPort">Port serveur</Label>
                    <Input
                      id="serverPort"
                      value={newServer.serverPort}
                      onChange={(e) =>
                        setNewServer({ ...newServer, serverPort: e.target.value })
                      }
                      placeholder="7777"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="queryPort">Port query</Label>
                    <Input
                      id="queryPort"
                      value={newServer.queryPort}
                      onChange={(e) =>
                        setNewServer({ ...newServer, queryPort: e.target.value })
                      }
                      placeholder="27015"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rconPort">Port RCON</Label>
                    <Input
                      id="rconPort"
                      value={newServer.rconPort}
                      onChange={(e) =>
                        setNewServer({ ...newServer, rconPort: e.target.value })
                      }
                      placeholder="32330"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rconPassword">Mot de passe RCON</Label>
                  <Input
                    id="rconPassword"
                    type="password"
                    value={newServer.rconPassword}
                    onChange={(e) =>
                      setNewServer({ ...newServer, rconPassword: e.target.value })
                    }
                    placeholder="Mot de passe sécurisé"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateServer}
                  disabled={createServerMutation.isPending}
                >
                  {createServerMutation.isPending ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-gray-500">Chargement...</p>
            </CardContent>
          </Card>
        ) : servers && servers.length > 0 ? (
          <div className="grid gap-6">
            {servers.map((server) => (
              <Card key={server.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{server.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Instance: {server.instanceName} • Carte: {server.serverMap}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          server.status === "online"
                            ? "bg-green-100 text-green-800"
                            : server.status === "offline"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {server.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Joueurs max</p>
                      <p className="font-medium">{server.maxPlayers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Port serveur</p>
                      <p className="font-medium">{server.serverPort}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Port query</p>
                      <p className="font-medium">{server.queryPort}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Port RCON</p>
                      <p className="font-medium">{server.rconPort}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startServerMutation.mutate({ id: server.id })}
                      disabled={
                        server.status === "online" ||
                        server.status === "starting" ||
                        startServerMutation.isPending
                      }
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Démarrer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => stopServerMutation.mutate({ id: server.id })}
                      disabled={
                        server.status === "offline" ||
                        server.status === "stopping" ||
                        stopServerMutation.isPending
                      }
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Arrêter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restartServerMutation.mutate({ id: server.id })}
                      disabled={
                        server.status === "offline" ||
                        restartServerMutation.isPending
                      }
                    >
                      <RotateCw className="h-4 w-4 mr-1" />
                      Redémarrer
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Configurer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (
                          confirm(
                            `Êtes-vous sûr de vouloir supprimer le serveur "${server.name}" ?`
                          )
                        ) {
                          deleteServerMutation.mutate({ id: server.id });
                        }
                      }}
                      disabled={deleteServerMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  Aucun serveur configuré. Créez votre premier serveur pour
                  commencer.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un serveur
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

