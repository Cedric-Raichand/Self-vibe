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
  placeholder: '#E3E3E3',
};

// ---------------------------------------------------------------------------
// Images exported from Figma (all inside ./assets).
// ---------------------------------------------------------------------------
const IMAGES = {
  hero: require('./assets/Background.png'),
  header: require('./assets/header.png'),
  buttons: require('./assets/buttons.png'),
  venueA: require('./assets/Venue-A.png'),
  venueB: require('./assets/Venue-B.png'),
  map: require('./assets/map.png'),
};

// ---------------------------------------------------------------------------
// Static data (hardcoded for now; replace with an API later).
// ---------------------------------------------------------------------------
const VENUE = {
  address: 'East Legon, Accra, Ghana',
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
        {/* Hero (image only) */}
        <View style={styles.hero}>
          <Photo source={IMAGES.hero} style={StyleSheet.absoluteFill} />
        </View>

        <View style={styles.body}>
          {/* Header image + notice + buttons image (all display only) */}
          <View>
            <Image
              source={IMAGES.header}
              style={styles.headerImage}
              resizeMode="contain"
            />

            <Text style={styles.notice}>{VENUE.notice}</Text>

            <Image
              source={IMAGES.buttons}
              style={styles.buttonsImage}
              resizeMode="contain"
            />
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
 screen: { flex: 1, backgroundColor: theme.white, width: '100%', maxWidth: 480, alignSelf: 'center' },
  hero: { width: '100%', height: 303, backgroundColor: theme.placeholder },

  body: { paddingHorizontal: 20, paddingTop: 20 },

  headerImage: { width: '100%', aspectRatio: 353 / 128 },
  buttonsImage: { width: '100%', aspectRatio: 353 / 112, marginTop: 20 },
  notice: { fontSize: 13, lineHeight: 19, color: theme.text, marginTop: 20 },

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

  map: { width: '100%', height: 197, borderRadius: 12 },
  address: { fontSize: 13, color: theme.text, marginTop: 10 },
  link: { fontSize: 13, color: theme.purple, marginTop: 4 },

  divider: { height: 1, backgroundColor: theme.border, marginTop: 24 },
});