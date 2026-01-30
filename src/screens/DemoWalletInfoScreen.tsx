import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useWeb3 } from '../context/Web3Context';
import {
  getWalletDisplayInfo,
  getConnectionStatus,
  resetDemoWallet,
  getWalletAge,
  getLastConnectionTime,
  formatWalletInfo,
} from '../utils/demoWalletHelpers';
import { exportWalletData, importWalletData } from '../services/demoWalletService';

/**
 * Demo Wallet Info Component
 * Displays detailed information about the demo wallet
 * Useful for testing and debugging
 */
export const DemoWalletInfoScreen: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet, network, chainId } = useWeb3();
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [walletAge, setWalletAge] = useState<any>(null);
  const [lastConnection, setLastConnection] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWalletInfo();
  }, [isConnected, account]);

  const loadWalletInfo = async () => {
    try {
      const info = await getWalletDisplayInfo();
      const status = await getConnectionStatus();
      const age = await getWalletAge();
      const lastConn = await getLastConnectionTime();

      setWalletInfo(info);
      setConnectionStatus(status);
      setWalletAge(age);
      setLastConnection(lastConn);
    } catch (error) {
      console.error('Error loading wallet info:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connectWallet();
      await loadWalletInfo();
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await disconnectWallet();
      await loadWalletInfo();
    } catch (error) {
      Alert.alert('Error', 'Failed to disconnect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset Wallet',
      'This will generate a new wallet address. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await resetDemoWallet();
              await loadWalletInfo();
              Alert.alert('Success', 'New wallet generated');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset wallet');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const data = await exportWalletData();
      console.log('Exported Wallet Data:', data);
      Alert.alert('Exported', 'Check console for wallet data');
    } catch (error) {
      Alert.alert('Error', 'Failed to export wallet data');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Demo Wallet System</Text>
      
      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
          {isConnected && (
            <>
              <Text style={styles.infoText}>Network: {network || 'Unknown'}</Text>
              <Text style={styles.infoText}>Chain ID: {chainId || 'Unknown'}</Text>
            </>
          )}
        </View>
      </View>

      {/* Wallet Info */}
      {walletInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Information</Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{walletInfo.name}</Text>
            
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{walletInfo.formattedAddress}</Text>
            
            <Text style={styles.label}>Full Address:</Text>
            <Text style={styles.valueSmall}>{walletInfo.address}</Text>
            
            <Text style={styles.label}>Balance:</Text>
            <Text style={styles.value}>{walletInfo.balance} ETH</Text>
          </View>
        </View>
      )}

      {/* Wallet Age */}
      {walletAge && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Age</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {walletAge.days} days, {walletAge.hours} hours, {walletAge.minutes} minutes
            </Text>
          </View>
        </View>
      )}

      {/* Last Connection */}
      {lastConnection && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Connection</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{lastConnection.toLocaleString()}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        {!isConnected ? (
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={handleConnect}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={handleDisconnect}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Disconnecting...' : 'Disconnect Wallet'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Reset Wallet (Generate New)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.exportButton]}
          onPress={handleExport}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Export Wallet Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={loadWalletInfo}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Refresh Info</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info</Text>
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            Raw Account: {account || 'Not connected'}
          </Text>
          <Text style={styles.debugText}>
            Connection State: {JSON.stringify(connectionStatus, null, 2)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  statusBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  valueSmall: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },
  exportButton: {
    backgroundColor: '#2196F3',
  },
  refreshButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugBox: {
    backgroundColor: '#263238',
    padding: 15,
    borderRadius: 8,
  },
  debugText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

export default DemoWalletInfoScreen;
