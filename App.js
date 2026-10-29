import React from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ---------------------------------------------------------------------------
// Design tokens. Guessed from the Figma screenshots, so confirm them in
// Dev Mode (click an element -> check font, size and hex) and tweak here.
// ---------------------------------------------------------------------------
const theme = {
  black: '#000000',
  white: '#FFFFFF',
  purple: '#4F46E5',
  text: '#111111',
  muted: '#6B6B6B',
  border: '#E6E6E6',
  surface: '#F9F9F9',
  placeholder: '#E3E3E3',
};

// ---------------------------------------------------------------------------
// Images. Everything is null (grey placeholder) until you export the images
// from Figma into ./assets and swap in require('./assets/hero.png') etc.
// ---------------------------------------------------------------------------
const IMAGES = {
  hero: require('./assets/Background.png'),
  venueA: require('./assets/Venue-A.png'),
  venueB: require('./assets/Venue-B.png'),
  map: require('./assets/map.png'),
  header: require('./assets/header.png'),
  buttons: require('./assets/buttons.png'),

};

// ---------------------------------------------------------------------------
// Static data (hardcoded for now; replace with an API later).
// ---------------------------------------------------------------------------
const VENUE = {
  name: 'Nails Geek',
  category: 'Beauty salon',
  distance: '>30 km',
  area: 'East Legon, Accra',
  address: 'East Legon, Accra, Ghana',
  phone: '+233550371895', // verify against the Figma file
  notice:
    'Unfortunately, this venue is not on the Self Vibe partner network. You can give them a call to make a booking. If you like, we will notify you by email if this venue joins.',
  services:
    'Acne treatments, Acrylic nails, Body waxing, Brazilian waxing, Manicure, Massage, Microblading, Pedicure, Permanent makeup',
};

const SIMILAR = [
  {
    id: '1',
    name: 'Prestige Luxe Spa',
    verified: true,
    rating: '5.0',
    distance: '3.3 mi',
    area: 'Kpeshie, Accra',
    type: 'Hair salon',
    reviews: 42,
    image: IMAGES.venueA,
  },
  {
    id: '2',
    name: 'Brielle Cosmetics',
    verified: false,
    rating: '5.0',
    distance: '3.3 mi',
    area: 'Kpeshie, Accra',
    type: 'Hair salon',
    reviews: 42,
    image: IMAGES.venueB,
  },
];

const NEARBY = SIMILAR;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function Photo({ source, style }) {
  if (source) {
    return <Image source={source} style={style} resizeMode="cover" />;
  }
  return <View style={[style, { backgroundColor: theme.placeholder }]} />;
}

function CircleButton({ icon, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.circleBtn, style]} hitSlop={8}>
      <Ionicons name={icon} size={16} color={theme.text} />
    </Pressable>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function VenueCard({ venue }) {
  return (
    <View style={styles.card}>
      <View>
        <Photo source={venue.image} style={styles.cardImage} />
        <CircleButton
          icon="heart-outline"
          style={styles.cardHeart}
          onPress={() => {}}
        />
      </View>

      <View style={styles.cardNameRow}>
        <View style={styles.cardNameLeft}>
          <Text style={styles.cardName} numberOfLines={1}>
            {venue.name}
          </Text>
          {venue.verified && (
            <Ionicons
              name="checkmark-circle"
              size={13}
              color={theme.purple}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
        <View style={styles.ratingRow}>
          <Text style={styles.cardName}>{venue.rating}</Text>
          <Ionicons name="star" size={11} color="#F5B301" style={{ marginLeft: 2 }} />
        </View>
      </View>

      <Text style={styles.cardMeta} numberOfLines={1}>
        {venue.distance} · {venue.area}
      </Text>
      <Text style={styles.cardMeta} numberOfLines={1}>
        {venue.type} · {venue.reviews} reviews
      </Text>
    </View>
  );
}

function VenueList({ data }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => <VenueCard venue={item} />}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      style={styles.listBleed}
      contentContainerStyle={styles.listContent}
    />
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function VenueScreen() {
  const callVenue = () => Linking.openURL(`tel:${VENUE.phone}`);
  const emailMe = () =>
    Alert.alert('Done', "We'll email you when this venue is available.");
  const getDirections = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        VENUE.address
      )}`
    );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Photo source={IMAGES.hero} style={StyleSheet.absoluteFill} />
        </View>

        <View style={styles.body}>
          {/* Header + notice + actions */}
          <View>
            {IMAGES.header ? (
              <Image
                source={IMAGES.header}
                style={styles.headerImage}
                resizeMode="contain"
              />
            ) : (
              <>
                <Text style={styles.title}>{VENUE.name}</Text>
                <Text style={styles.category}>{VENUE.category}</Text>

                <View style={styles.locationPill}>
                  <Ionicons name="location-sharp" size={12} color={theme.text} />
                  <Text style={styles.locationText}>
                    {VENUE.distance} · {VENUE.area}
                  </Text>
                </View>
              </>
            )}

            <Text style={styles.notice}>{VENUE.notice}</Text>

            {IMAGES.buttons ? (
              <View style={styles.buttonsImage}>
                <Image
                  source={IMAGES.buttons}
                  style={StyleSheet.absoluteFill}
                  resizeMode="contain"
                />
                {/* Invisible tap areas on top of the image: top half = Call, bottom half = Email */}
                <View style={StyleSheet.absoluteFill}>
                  <Pressable style={{ flex: 1 }} onPress={callVenue} />
                  <Pressable style={{ flex: 1 }} onPress={emailMe} />
                </View>
              </View>
            ) : (
              <>
                <Pressable style={styles.primaryBtn} onPress={callVenue}>
                  <Text style={styles.primaryBtnText}>Call venue</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={emailMe}>
                  <Text style={styles.secondaryBtnText}>Email me when available</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Similar venues */}
          <View style={styles.section}>
            <SectionTitle>Similar venues you may like</SectionTitle>
            <VenueList data={SIMILAR} />
          </View>

          {/* Services */}
          <View style={styles.section}>
            <SectionTitle>Services</SectionTitle>
            <Text style={styles.bodyText}>{VENUE.services}</Text>
          </View>

          {/* Map */}
          <View style={styles.section}>
            <Photo source={IMAGES.map} style={styles.map} />
            <Text style={styles.address}>{VENUE.address}</Text>
            <Pressable onPress={getDirections}>
              <Text style={styles.link}>Get direction</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Venues nearby */}
          <View style={{ marginTop: 24 }}>
            <SectionTitle>Venues nearby</SectionTitle>
            <VenueList data={NEARBY} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles. Numbers come from Figma: 393 wide frame, 20px side padding
// (content is 353), hero 303 tall, 42px between sections.
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.white },

  hero: { width: '100%', height: 303, backgroundColor: theme.placeholder },
  heroBack: { position: 'absolute', top: 52, left: 20 },
  heroActions: {
    position: 'absolute',
    top: 52,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  claimPill: {
    position: 'absolute',
    right: 20,
    bottom: 14,
    backgroundColor: theme.purple,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  claimText: { color: theme.white, fontSize: 11, fontWeight: '600' },

  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { paddingHorizontal: 20, paddingTop: 20 },

  headerImage: { width: '100%', aspectRatio: 353 / 128 },
  buttonsImage: { width: '100%', aspectRatio: 353 / 112, marginTop: 20 },
  title: { fontSize: 22, fontWeight: '700', color: theme.text },
  category: { fontSize: 13, color: theme.muted, marginTop: 4 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: theme.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 14,
    gap: 6,
  },
  locationText: { fontSize: 12, color: theme.text },
  notice: { fontSize: 13, lineHeight: 19, color: theme.text, marginTop: 20 },

  primaryBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: theme.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryBtnText: { color: theme.white, fontSize: 14, fontWeight: '600' },
  secondaryBtn: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryBtnText: { color: theme.text, fontSize: 14, fontWeight: '500' },

  section: { marginTop: 42 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  bodyText: { fontSize: 13, lineHeight: 19, color: theme.text },

  // Horizontal lists bleed to the screen edges but start aligned with content.
  listBleed: { marginHorizontal: -20 },
  listContent: { paddingHorizontal: 20 },

  card: { width: 245 },
  cardImage: { width: 245, height: 165, borderRadius: 12 },
  cardHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardNameLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  cardName: { fontSize: 13, fontWeight: '600', color: theme.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  cardMeta: { fontSize: 12, color: theme.muted, marginTop: 3 },

  map: { width: '100%', height: 197, borderRadius: 12 },
  address: { fontSize: 13, color: theme.text, marginTop: 10 },
  link: { fontSize: 13, color: theme.purple, marginTop: 4 },

  divider: { height: 1, backgroundColor: theme.border, marginTop: 24 },
});