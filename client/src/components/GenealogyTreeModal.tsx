import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Users, Crown, Zap } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  title: string;
  generation: number;
  reignStart?: number;
  reignEnd?: number;
  traits: string[];
  children?: string[];
  parent?: string;
}

interface GenealogyTreeModalProps {
  civilizationName: string;
  familyTree: FamilyMember[];
  isOpen: boolean;
  onClose: () => void;
  onMemberSelect?: (member: FamilyMember) => void;
}

export function GenealogyTreeModal({
  civilizationName,
  familyTree,
  isOpen,
  onClose,
  onMemberSelect,
}: GenealogyTreeModalProps) {
  // Organize by generation
  const generations = new Map<number, FamilyMember[]>();
  familyTree.forEach((member) => {
    if (!generations.has(member.generation)) {
      generations.set(member.generation, []);
    }
    generations.get(member.generation)!.push(member);
  });

  const sortedGenerations = Array.from(generations.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                {civilizationName} Lineage
              </DialogTitle>
              <p className="text-slate-400 text-sm mt-1">
                {familyTree.length} rulers across {sortedGenerations.length} generations
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {sortedGenerations.map(([generation, members]) => (
            <Card key={generation} className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-base">Generation {generation + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => onMemberSelect?.(member)}
                      className="p-4 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{member.name}</h4>
                          <p className="text-sm text-slate-300">{member.title}</p>
                        </div>
                        <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      </div>

                      {member.reignStart && (
                        <p className="text-xs text-slate-400 mb-2">
                          Reign: {member.reignStart}
                          {member.reignEnd ? ` - ${member.reignEnd}` : " - Present"}
                        </p>
                      )}

                      {member.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.traits.slice(0, 3).map((trait, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 bg-blue-900 text-blue-200 text-xs rounded"
                            >
                              {trait}
                            </span>
                          ))}
                          {member.traits.length > 3 && (
                            <span className="inline-block px-2 py-0.5 bg-slate-500 text-slate-200 text-xs rounded">
                              +{member.traits.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {member.children && member.children.length > 0 && (
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {member.children.length} heir(s)
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Succession Summary */}
          {familyTree.length > 0 && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Succession Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {familyTree
                    .filter((m) => m.reignStart)
                    .sort((a, b) => (a.reignStart || 0) - (b.reignStart || 0))
                    .map((member, idx) => (
                      <div key={member.id} className="flex items-center gap-3 text-sm">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-blue-200 font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{member.name}</p>
                          <p className="text-slate-400 text-xs">
                            {member.reignStart}
                            {member.reignEnd ? ` - ${member.reignEnd}` : " - Present"}
                            {member.reignEnd && member.reignStart
                              ? ` (${member.reignEnd - member.reignStart} years)`
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
