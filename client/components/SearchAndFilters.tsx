import React from "react";
import { View, TextInput, ScrollView, TouchableOpacity, Text } from "react-native";
import { Search } from "lucide-react-native";

export interface FilterItem {
  key: string;
  label: string;
}

interface SearchAndFiltersProps {
  search: string;
  onSearchChange: (text: string) => void;
  placeholder: string;
  filters?: FilterItem[];
  activeFilter?: string;
  onFilterChange?: (key: any) => void;
}

export function SearchAndFilters({
  search,
  onSearchChange,
  placeholder,
  filters,
  activeFilter,
  onFilterChange
}: SearchAndFiltersProps) {
  return (
    <View className="mb-4">
      {/* SEARCH BAR */}
      <View className="flex-row items-center bg-card border border-border/80 rounded-2xl px-4 py-3 mb-3 shadow-sm">
        <Search className="text-muted-foreground mr-2" size={18} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={onSearchChange}
          className="flex-1 text-foreground text-sm py-0.5"
        />
      </View>

      {/* FILTER PILLS */}
      {filters && filters.length > 0 && onFilterChange && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filters.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => onFilterChange(item.key)}
              activeOpacity={0.7}
              className={`px-4 py-2 rounded-full border ${
                activeFilter === item.key
                  ? "bg-primary border-primary"
                  : "bg-card border-border/80"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeFilter === item.key ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
