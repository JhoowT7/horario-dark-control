import React, { useState, useRef } from "react";
import { Employee, DocumentRequest, DocumentFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, X, Plus, Trash2, Eye, Download, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentRequestsProps {
  employee: Employee;
}

const DOCUMENT_REQUESTS_KEY = "timeTracker_documentRequests";

const DocumentRequests: React.FC<DocumentRequestsProps> = ({ employee }) => {
  const [requests, setRequests] = useState<DocumentRequest[]>(() => {
    const stored = localStorage.getItem(DOCUMENT_REQUESTS_KEY);
    const allRequests = stored ? JSON.parse(stored) : [];
    return allRequests.filter((r: DocumentRequest) => r.employeeId === employee.id);
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<DocumentRequest>>({
    type: "atestado",
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    files: []
  });
  const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveRequests = (updatedRequests: DocumentRequest[]) => {
    // Get all requests from storage
    const stored = localStorage.getItem(DOCUMENT_REQUESTS_KEY);
    const allRequests: DocumentRequest[] = stored ? JSON.parse(stored) : [];
    
    // Filter out current employee's requests and add updated ones
    const otherRequests = allRequests.filter((r: DocumentRequest) => r.employeeId !== employee.id);
    const finalRequests = [...otherRequests, ...updatedRequests];
    
    localStorage.setItem(DOCUMENT_REQUESTS_KEY, JSON.stringify(finalRequests));
    setRequests(updatedRequests);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`Arquivo ${file.name} muito grande. Máximo 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: DocumentFile = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target?.result as string,
          uploadedAt: new Date().toISOString()
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = () => {
    if (!newRequest.title || !newRequest.type || !newRequest.date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const request: DocumentRequest = {
      id: uuidv4(),
      employeeId: employee.id,
      type: newRequest.type as "atestado" | "documento" | "outro",
      title: newRequest.title,
      description: newRequest.description || "",
      date: newRequest.date,
      createdAt: new Date().toISOString(),
      status: "pendente",
      files: uploadedFiles
    };

    const updatedRequests = [...requests, request];
    saveRequests(updatedRequests);
    
    // Reset form
    setNewRequest({
      type: "atestado",
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      files: []
    });
    setUploadedFiles([]);
    setIsDialogOpen(false);
    
    toast.success("Requisição enviada com sucesso!");
  };

  const deleteRequest = (requestId: string) => {
    const updatedRequests = requests.filter(r => r.id !== requestId);
    saveRequests(updatedRequests);
    toast.info("Requisição removida");
  };

  const downloadFile = (file: DocumentFile) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case "aprovado":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "atestado":
        return <Badge className="bg-blue-500/20 text-blue-400">Atestado</Badge>;
      case "documento":
        return <Badge className="bg-purple-500/20 text-purple-400">Documento</Badge>;
      case "outro":
        return <Badge className="bg-gray-500/20 text-gray-400">Outro</Badge>;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyanBlue" />
            Requisições e Documentos
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-cyanBlue hover:bg-cyanBlue/90 text-black">
                <Plus className="h-4 w-4 mr-1" /> Nova Requisição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Requisição</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tipo de Requisição *</Label>
                  <Select 
                    value={newRequest.type} 
                    onValueChange={(value) => setNewRequest(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atestado">Atestado Médico</SelectItem>
                      <SelectItem value="documento">Documento</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={newRequest.title}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Atestado médico - consulta"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={newRequest.date}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva a requisição..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Anexar Arquivos</Label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-cyanBlue/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Clique para selecionar arquivos</p>
                    <p className="text-xs text-gray-500">Máximo 5MB por arquivo</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {uploadedFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSubmit} className="bg-cyanBlue hover:bg-cyanBlue/90 text-black">
                    Enviar Requisição
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma requisição encontrada</p>
            <p className="text-sm">Clique em "Nova Requisição" para criar uma</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(request => (
              <div key={request.id} className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(request.type)}
                      <span className="font-medium">{request.title}</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {format(parseISO(request.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Button variant="ghost" size="sm" onClick={() => deleteRequest(request.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
                
                {request.description && (
                  <p className="text-sm text-gray-300">{request.description}</p>
                )}
                
                {request.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {request.files.map(file => (
                      <Button
                        key={file.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => downloadFile(file)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {file.name}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 pt-1">
                  Criado em {format(parseISO(request.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentRequests;
