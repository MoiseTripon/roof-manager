import React from "react";
import { Wall } from "@/types/roof";

interface WallEditorProps {
  walls: Wall[];
  onUpdateWall: (wallId: string, updates: Partial<Wall>) => void;
  unitLabel: string;
}

export const WallEditor: React.FC<WallEditorProps> = ({
  walls,
  onUpdateWall,
  unitLabel,
}) => {
  return (
    <div className="space-y-3">
      {walls.map((wall) => (
        <div
          key={wall.id}
          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={wall.name}
              onChange={(e) => onUpdateWall(wall.id, { name: e.target.value })}
              className="text-sm font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-xs text-gray-500 capitalize">
              {wall.position}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Height ({unitLabel})
              </label>
              <input
                type="number"
                value={wall.height}
                onChange={(e) =>
                  onUpdateWall(wall.id, {
                    height: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Length ({unitLabel})
              </label>
              <input
                type="number"
                value={wall.length}
                onChange={(e) =>
                  onUpdateWall(wall.id, {
                    length: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
