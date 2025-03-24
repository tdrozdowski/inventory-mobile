import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Switch, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  apiUrl?: string;
  apiEnvironment?: string;
}

export function ErrorDisplay({ message, onRetry, apiUrl, apiEnvironment }: ErrorDisplayProps) {
  const [showDebug, setShowDebug] = useState(false);

  // Only show debug toggle if we have API details
  const hasApiDetails = apiUrl || apiEnvironment;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.iconContainer}>
        <IconSymbol
          name="exclamationmark.triangle.fill"
          size={40}
          color="#FF6B6B"
        />
      </ThemedView>

      <ThemedText style={styles.errorTitle} type="subtitle">
        Something went wrong
      </ThemedText>

      <ThemedText style={styles.errorMessage}>
        {message}
      </ThemedText>

      {hasApiDetails && (
        <ThemedView style={styles.debugContainer}>
          <View style={styles.debugToggle}>
            <ThemedText style={styles.debugLabel}>Show Debug Info</ThemedText>
            <Switch
              value={showDebug}
              onValueChange={setShowDebug}
              trackColor={{ false: '#767577', true: '#4A90E280' }}
              thumbColor={showDebug ? '#4A90E2' : '#f4f3f4'}
            />
          </View>

          {showDebug && (
            <ThemedView style={styles.debugInfo}>
              {apiEnvironment && (
                <ThemedText style={styles.debugText}>
                  Environment: {apiEnvironment}
                </ThemedText>
              )}
              {apiUrl && (
                <ThemedText style={styles.debugText}>
                  API URL: {apiUrl}
                </ThemedText>
              )}
            </ThemedView>
          )}
        </ThemedView>
      )}

      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <IconSymbol
            name="arrow.clockwise"
            size={20}
            color="#FFFFFF"
          />
          <ThemedText style={styles.retryText}>Try Again</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B20',
    backgroundColor: '#FF6B6B10',
    alignItems: 'center',
    margin: 16,
  },
  iconContainer: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  errorTitle: {
    marginBottom: 8,
    color: '#FF6B6B',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },
  debugContainer: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  debugToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  debugLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  debugInfo: {
    marginTop: 8,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E240',
    backgroundColor: '#4A90E210',
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
