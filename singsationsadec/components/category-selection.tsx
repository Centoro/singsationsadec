"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import CategoryRegistration from "@/components/category-registration"

interface CategorySelectionProps {
  onNext: (category: string) => void
  onProfile?: () => void // Added profile navigation prop
}

export default function CategorySelection({ onNext, onProfile }: CategorySelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    {
      id: "adults",
      title: "Adults Competition",
      description: "Ages 18 and up - Show your vocal prowess",
      icon: "🎤",
    },
    {
      id: "kids",
      title: "Kids Competition",
      description: "Ages 6-17 - Young talent showcase",
      icon: "🌟",
    },
    {
      id: "celebrities",
      title: "Celebrity Competition",
      description: "Special celebrity showcase category",
      icon: "⭐",
    },
  ]

  if (selectedCategory) {
    return (
      <CategoryRegistration
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        onNext={() => onNext(selectedCategory)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-4">
      <div className="max-w-md mx-auto pt-8">
        {onProfile && (
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              onClick={onProfile}
              className="text-white hover:bg-white/20 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Category</h1>
          <p className="text-white/90">Select the competition category that suits you best</p>
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">{category.icon}</div>
                <CardTitle className="text-xl text-gray-800">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">{category.description}</CardDescription>
                <Button
                  className="mt-4 w-full bg-amber-600 hover:bg-amber-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCategory(category.id)
                  }}
                >
                  Register for {category.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
