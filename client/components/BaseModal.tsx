import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BaseModal({ visible, onClose, title, children }: BaseModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 p-5">
        <View className="bg-card w-full max-h-[70vh] rounded-3xl border border-border shadow-2xl p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-foreground">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-1.5 bg-muted/40 rounded-full">
              <X className="text-foreground" size={16} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {children}
        </View>
      </View>
    </Modal>
  );
}
