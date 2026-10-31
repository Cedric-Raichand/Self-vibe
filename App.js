import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Linking,
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
// Only 4 images come from Figma (all inside ./assets). Everything else on the
// screen (title, location pill, notice, buttons, cards text) is coded below.
// ---------------------------------------------------------------------------
const IMAGES = {
  hero: require('./assets/Background.png'),
  venueA: require('./assets/Venue-A.png'),
  venueB: require('./assets/Venue-B.png'),
  map: require('./assets/map.png'),
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
  phone: '+233550371895', // read from tiny text in Figma, so double-check it
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

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function VenueCard({ venue }) {
  return (
    <View style={styles.card}>
      <View>
        <Photo source={venue.image} style={styles.cardImage} />
        <View style={styles.cardHeart}>
          <Ionicons name="heart-outline" size={15} color={theme.text} />
        </View>
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
  // true once the user taps "Email me when available"
  const [notify, setNotify] = useState(false);

  const callVenue = () => Linking.openURL(`tel:${VENUE.phone}`);

  const getDirections = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        VENUE.address
      )}`
    );

  return (
    <View style={styles.outer}>
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Hero (image only) */}
          <Image source={IMAGES.hero} style={styles.hero} resizeMode="cover" />

          <View style={styles.body}>
            {/* Title, location pill, notice, buttons */}
            <View>
              <Text style={styles.title}>{VENUE.name}</Text>
              <Text style={styles.category}>{VENUE.category}</Text>

              <View style={styles.locationPill}>
                <Ionicons name="location-sharp" size={12} color={theme.text} />
                <Text style={styles.locationText}>
                  {VENUE.distance} · {VENUE.area}
                </Text>
              </View>

              <Text style={styles.notice}>{VENUE.notice}</Text>

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                onPress={callVenue}
              >
                <Text style={styles.primaryBtnText}>Call venue</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                onPress={() => setNotify(true)}
              >
                <Text style={styles.secondaryBtnText}>
                  {notify
                    ? "We'll email you when it's available"
                    : 'Email me when available'}
                </Text>
              </Pressable>
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
              {/* The exported map image also has the address text baked in at the
                  bottom, so we crop to just the map part (top 197px). */}
              <View style={styles.mapWrap}>
                <Image
                  source={IMAGES.map}
                  style={styles.mapImage}
                  resizeMode="cover"
                />
              </View>
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
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles. Numbers come from Figma: 393 wide frame, 20px side padding
// (content is 353), hero 303 tall, 42px between sections.
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // On a phone this fills the screen. On a laptop (web) it becomes a centered
  // phone-sized column with a light grey background around it.
  outer: { flex: 1, alignItems: 'center', backgroundColor: '#F2F2F2' },
  screen: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: theme.white },

  hero: { width: '100%', height: 303 },

  body: { paddingHorizontal: 20, paddingTop: 20 },

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
  locationText: { fontSize: 13, fontWeight: '500', color: theme.black },
  notice: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.black,
    marginTop: 20,
  },

  primaryBtn: {
    height: 48,
    borderRadius: 999,
    backgroundColor: theme.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryBtnText: { color: theme.white, fontSize: 14, fontWeight: '600' },
  secondaryBtn: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryBtnText: { color: theme.text, fontSize: 14, fontWeight: '500' },
  pressed: { opacity: 0.7 },

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
    backgroundColor: theme.white,
    alignItems: 'center',
    justifyContent: 'center',
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

  mapWrap: { width: '100%', height: 197, borderRadius: 12, overflow: 'hidden' },
  mapImage: { width: '100%', aspectRatio: 353 / 260 },
  address: { fontSize: 13, color: theme.text, marginTop: 10 },
  link: { fontSize: 13, color: theme.purple, marginTop: 4 },

  divider: { height: 1, backgroundColor: theme.border, marginTop: 24 },
});