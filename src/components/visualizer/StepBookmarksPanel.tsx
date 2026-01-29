import { Bookmark, ChevronLeft, ChevronRight, Trash2, BookmarkPlus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import type { Bookmark as BookmarkType } from "@/hooks/useStepBookmarks";

interface StepBookmarksPanelProps {
  bookmarks: BookmarkType[];
  currentStep: number;
  totalSteps: number;
  hasBookmarkAtStep: (step: number) => boolean;
  onAddBookmark: (step: number, label?: string, description?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onToggleBookmark: (step: number, label?: string) => boolean;
  onJumpToStep: (step: number) => void;
  onJumpToNextBookmark: () => void;
  onJumpToPreviousBookmark: () => void;
  onClearBookmarks: () => void;
}

export const StepBookmarksPanel = ({
  bookmarks,
  currentStep,
  totalSteps,
  hasBookmarkAtStep,
  onAddBookmark,
  onRemoveBookmark,
  onToggleBookmark,
  onJumpToStep,
  onJumpToNextBookmark,
  onJumpToPreviousBookmark,
  onClearBookmarks,
}: StepBookmarksPanelProps) => {
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [newBookmarkLabel, setNewBookmarkLabel] = useState("");

  const isCurrentStepBookmarked = hasBookmarkAtStep(currentStep);

  const handleAddBookmark = () => {
    if (isAddingBookmark) {
      const label = newBookmarkLabel.trim() || `Step ${currentStep + 1}`;
      onAddBookmark(currentStep, label);
      setNewBookmarkLabel("");
      setIsAddingBookmark(false);
      toast.success(`Bookmark added: ${label}`);
    } else {
      setIsAddingBookmark(true);
    }
  };

  const handleQuickToggle = () => {
    const wasAdded = onToggleBookmark(currentStep);
    if (wasAdded) {
      toast.success(`Bookmark added at step ${currentStep + 1}`);
    } else {
      toast.info(`Bookmark removed from step ${currentStep + 1}`);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingBookmark(false);
    setNewBookmarkLabel("");
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Bookmarks
            {bookmarks.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {bookmarks.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onJumpToPreviousBookmark}
              disabled={bookmarks.length === 0 || bookmarks.every((b) => b.stepIndex >= currentStep)}
              title="Previous Bookmark"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onJumpToNextBookmark}
              disabled={bookmarks.length === 0 || bookmarks.every((b) => b.stepIndex <= currentStep)}
              title="Next Bookmark"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Add bookmark controls */}
        <div className="flex gap-2">
          {isAddingBookmark ? (
            <>
              <Input
                value={newBookmarkLabel}
                onChange={(e) => setNewBookmarkLabel(e.target.value)}
                placeholder={`Step ${currentStep + 1}`}
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddBookmark();
                  if (e.key === "Escape") handleCancelAdd();
                }}
              />
              <Button size="sm" variant="default" onClick={handleAddBookmark} className="h-8">
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelAdd} className="h-8 px-2">
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant={isCurrentStepBookmarked ? "secondary" : "outline"}
                onClick={handleQuickToggle}
                className="flex-1 h-8 text-xs"
                disabled={totalSteps === 0}
              >
                <BookmarkPlus className="h-3 w-3 mr-1" />
                {isCurrentStepBookmarked ? "Remove Bookmark" : "Bookmark Step"}
              </Button>
              {bookmarks.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearBookmarks}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  title="Clear all bookmarks"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Bookmarks list */}
        {bookmarks.length > 0 ? (
          <ScrollArea className="h-[120px]">
            <div className="space-y-1">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    bookmark.stepIndex === currentStep
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                  onClick={() => onJumpToStep(bookmark.stepIndex)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Bookmark
                      className={`h-3 w-3 shrink-0 ${
                        bookmark.stepIndex === currentStep ? "text-primary fill-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-xs font-medium truncate">{bookmark.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {bookmark.stepIndex + 1}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(bookmark.id);
                        toast.info("Bookmark removed");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No bookmarks yet. Add bookmarks to quickly jump to important steps.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
