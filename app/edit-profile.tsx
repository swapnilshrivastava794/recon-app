import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './context/AuthContext';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '@/constants/theme';
import Bounceable from '@/components/BouncyButton';
import axios from 'axios';
import { updateReporterProfile } from './server'; // We will add this

const ID_TYPES = [
    { label: 'Aadhaar Card', value: 'AADHAAR' },
    { label: 'Passport', value: 'PASSPORT' },
    { label: 'Driving License', value: 'DRIVING_LICENSE' },
    { label: 'Voter ID', value: 'VOTER_ID' },
];

export default function EditProfileScreen() {
    const { userProfile, refreshProfile } = useAuth();
    const router = useRouter();
    const colors = Colors['light']; // Force light mode for now or use hook

    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [phone, setPhone] = useState(userProfile?.phone_number || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [experience, setExperience] = useState(userProfile?.years_of_experience?.toString() || '');
    const [address1, setAddress1] = useState(userProfile?.address_line1 || '');
    const [address2, setAddress2] = useState(userProfile?.address_line2 || '');
    const [city, setCity] = useState(userProfile?.city || '');
    const [state, setState] = useState(userProfile?.state || '');
    const [pincode, setPincode] = useState(userProfile?.pincode || '');
    
    const [idType, setIdType] = useState(userProfile?.id_proof_type || '');
    const [idNumber, setIdNumber] = useState(userProfile?.id_proof_number || '');
    
    const [selfie, setSelfie] = useState<any>(null); // For local preview/file
    const [idDoc, setIdDoc] = useState<any>(null); // For local preview/file

    const [modalVisible, setModalVisible] = useState(false);

    const getFullImageUrl = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.29.97:8000${path}`;
    };

    const handleSelfiePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelfie(result.assets[0]);
        }
    };

    const handleDocPick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                setIdDoc(result.assets[0]);
            }
        } catch (err) {
            console.log('Document picker error', err);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('phone_number', phone);
            formData.append('bio', bio);
            formData.append('years_of_experience', experience); // Handle defaults if empty
            formData.append('address_line1', address1);
            formData.append('address_line2', address2);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('pincode', pincode);
            formData.append('id_proof_type', idType);
            formData.append('id_proof_number', idNumber);

            if (selfie) {
                formData.append('selfie_photo', {
                    uri: selfie.uri,
                    name: 'selfie.jpg',
                    type: 'image/jpeg',
                } as any);
            }

            if (idDoc) {
                const isPdf = idDoc.mimeType === 'application/pdf' || idDoc.name.endsWith('.pdf');
                formData.append('id_proof_document', {
                    uri: idDoc.uri,
                    name: idDoc.name || 'document.pdf',
                    type: isPdf ? 'application/pdf' : 'image/jpeg',
                } as any);
            }

            const response = await updateReporterProfile(formData);

            if (response.data && response.data.status) {
                Alert.alert("Success", "Profile updated successfully!");
                await refreshProfile(); // Refresh context
                router.back();
            } else {
                Alert.alert("Error", response.data.message || "Failed to update profile.");
            }

        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView edges={['top']} style={styles.header}>
                <Bounceable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Bounceable>
                <Text style={styles.headerTitle}>EDIT PROFILE</Text>
                <View style={{ width: 40 }} /> 
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Selfie Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile Photo</Text>
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <Bounceable onPress={handleSelfiePick}>
                            <Image 
                                source={{ uri: selfie ? selfie.uri : getFullImageUrl(userProfile?.selfie_photo) || 'https://via.placeholder.com/150' }} 
                                style={styles.avatar} 
                            />
                            <View style={styles.editOverlay}>
                                <Ionicons name="camera" size={12} color="#FFF" />
                            </View>
                        </Bounceable>
                        <Text style={styles.helperText}>Tap to change selfie</Text>
                    </View>
                </View>

                {/* Personal Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    <View style={styles.card}>
                        <InputGroup label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        <InputGroup label="Bio" value={bio} onChangeText={setBio} multiline />
                        <InputGroup label="Years of Experience" value={experience} onChangeText={setExperience} keyboardType="numeric" />
                    </View>
                </View>

                {/* Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address Details</Text>
                    <View style={styles.card}>
                        <InputGroup label="Address Line 1" value={address1} onChangeText={setAddress1} />
                        <InputGroup label="Address Line 2" value={address2} onChangeText={setAddress2} />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}><InputGroup label="City" value={city} onChangeText={setCity} /></View>
                            <View style={{ flex: 1 }}><InputGroup label="State" value={state} onChangeText={setState} /></View>
                        </View>
                        <InputGroup label="Pincode" value={pincode} onChangeText={setPincode} keyboardType="numeric" />
                    </View>
                </View>

                {/* KYC Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>KYC Documents</Text>
                    <View style={styles.card}>
                        
                        {/* ID Type Selector */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ID Type</Text>
                            <TouchableOpacity style={styles.pickerTrigger} onPress={() => setModalVisible(true)}>
                                <Text style={styles.inputText}>{ID_TYPES.find(t => t.value === idType)?.label || idType || 'Select ID Type'}</Text>
                                <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <InputGroup label="ID Number" value={idNumber} onChangeText={setIdNumber} />

                        {/* Document Upload */}
                        <View style={[styles.inputGroup, { borderBottomWidth: 0 }]}>
                            <Text style={styles.label}>ID Document</Text>
                            <Bounceable onPress={handleDocPick} style={styles.uploadBtn}>
                                <Ionicons name="cloud-upload-outline" size={24} color="#000" />
                                <Text style={styles.uploadText}>{idDoc ? idDoc.name : 'Update Document (PDF/Image)'}</Text>
                            </Bounceable>
                            {userProfile?.id_proof_document && !idDoc && (
                                <Text style={{ fontSize: 10, color: 'green', marginTop: 4 }}>
                                    ✓ Current document on file
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                <Bounceable style={[styles.saveBtn, isLoading && { opacity: 0.7 }]} onPress={() => !isLoading && handleSubmit()}>
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>SAVE CHANGES</Text>}
                </Bounceable>

            </ScrollView>

            {/* Modal for ID Type */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select ID Type</Text>
                        {ID_TYPES.map((item) => (
                            <TouchableOpacity 
                                key={item.value} 
                                style={[styles.modalItem, idType === item.value && styles.modalItemSelected]}
                                onPress={() => { setIdType(item.value); setModalVisible(false); }}
                            >
                                <Text style={[styles.modalItemText, idType === item.value && { color: '#FFF' }]}>{item.label}</Text>
                                {idType === item.value && <Ionicons name="checkmark" size={18} color="#FFF" />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const InputGroup = ({ label, value, onChangeText, multiline, keyboardType }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput 
            style={[styles.input, multiline && styles.textArea]} 
            value={value} 
            onChangeText={onChangeText}
            multiline={multiline}
            keyboardType={keyboardType}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5E5', backgroundColor: '#FFF' },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#000', letterSpacing: 1 },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: '#000', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E5E5' },
    inputGroup: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    label: { fontSize: 11, fontWeight: '700', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { fontSize: 16, color: '#000', fontWeight: '500', padding: 0 },
    inputText: { fontSize: 16, color: '#000', fontWeight: '500' },
    textArea: { minHeight: 60, textAlignVertical: 'top' },
    avatar: { width: 100, height: 100, borderRadius: 0, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#f9f9f9' },
    editOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000', padding: 6 },
    helperText: { fontSize: 12, color: '#999', marginTop: 8 },
    saveBtn: { backgroundColor: '#000', paddingVertical: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40 },
    saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
    pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, backgroundColor: '#F8F9FA', paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E5E5', borderStyle: 'dashed' },
    uploadText: { fontSize: 14, color: '#333', fontWeight: '500' },
    
    // Modal
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: '#FFF', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalItemSelected: { backgroundColor: '#000', marginHorizontal: -20, paddingHorizontal: 20 },
    modalItemText: { fontSize: 16, fontWeight: '600', color: '#333' },
    modalCancel: { marginTop: 20, paddingVertical: 15, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8 },
    modalCancelText: { fontWeight: '700', color: '#000' }
});
