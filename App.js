import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Linking,
  Share,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ---------------------------------------------------------------------------
// Design tokens. Guessed from the Figma screenshots, so confirm them in
// Dev Mode (click an element -> check font, size and hex) and tweak here.
// ---------------------------------------------------------------------------
const theme = {
  black: '#000000',
  white: '#FFFFFF',
  purple: '#5B45F5',
  text: '#111111',
  muted: '#6B6B6B',
  border: '#E6E6E6',
  surface: '#F9F9F9',
  placeholder: '#E3E3E3',
  heart: '#E11D48',
};

// ---------------------------------------------------------------------------
// 4 images from Figma (all inside ./assets).
//
// Background.png = the 393x303 hero exported at 2x (786x606). The status bar
// and the back/share/heart circles have been painted out of it (they are real
// buttons in the code now). Only the "Claim business" pill is still in the
// picture, so there is an invisible tap area on top of it.
// ---------------------------------------------------------------------------
const IMAGES = {
  hero: require('./assets/Background.png'),
  venueA: require('./assets/Venue-A.png'),
  venueB: require('./assets/Venue-B.png'),
  map: require('./assets/map.png'),

  // Desktop only ("There's more to explore" card). Export both from Figma at 2x,
  // put them in ./assets, then swap each null for its require(...) line:
  //   qr: require('./assets/qr.png'),
  //   phone: require('./assets/phone.png'),
  // While they are null, an icon stands in for the QR code and the phone is hidden.
  qr: require('./assets/qr.png'),
  phone: require('./assets/phone.png'),
};

// Screens at least this wide get the desktop layout (the web frame in Figma).
const DESKTOP_BREAKPOINT = 900;

// ---------------------------------------------------------------------------
// Static data (hardcoded for now; replace with an API later).
// ---------------------------------------------------------------------------
const VENUE = {
  name: 'Nails Geek',
  category: 'Beauty salon',
  type: 'Spa',
  distance: '>30 km',
  area: 'East Legon, Accra',
  city: 'Accra, Ghana',
  address: 'East Legon, Accra, Ghana',
  phone: '+233550371895', // read from tiny text in Figma, so double-check it
  phoneLabel: '+233 55 037 1895',
  notice:
    'Unfortunately, this venue is not on the Self Vibe partner network. You can give them a call to make a booking. If you like, we will notify you by email if this venue joins.',
  services:
    'At present, we do not have service information for this venue. Please see their website or wait to visit the venue to learn more.',
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

function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

// Round icon button. `outlined` is the white-with-border style used on desktop,
// the default is the frosted style that sits on top of the hero photo.
function RoundButton({ icon, label, onPress, active, outlined }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.roundBtn,
        outlined && styles.roundBtnOutlined,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={active ? 'heart' : icon}
        size={outlined ? 20 : 18}
        color={active ? theme.heart : theme.black}
      />
    </Pressable>
  );
}

function VenueCard({ venue, liked, onToggleLike }) {
  return (
    <View style={styles.card}>
      <View>
        <Photo source={venue.image} style={styles.cardImage} />
        <Pressable
          onPress={() => onToggleLike(venue)}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Remove from favourites' : 'Save to favourites'}
          hitSlop={8}
          style={({ pressed }) => [styles.cardHeart, pressed && styles.pressed]}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={15}
            color={liked ? theme.heart : theme.text}
          />
        </Pressable>
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

// Horizontal list of cards. `bleed` lets the list run to the screen edges while
// the first card still lines up with the page content (20 on mobile, 0 on desktop).
function VenueList({ data, liked, onToggleLike, bleed = 20 }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <VenueCard
          venue={item}
          liked={!!liked[item.id]}
          onToggleLike={onToggleLike}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      style={{ marginHorizontal: -bleed }}
      contentContainerStyle={{ paddingHorizontal: bleed }}
    />
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function VenueScreen() {
  const { width: winWidth } = useWindowDimensions();
  const isDesktop = winWidth >= DESKTOP_BREAKPOINT;

  const [notify, setNotify] = useState(false); // "Email me when available" tapped
  const [saved, setSaved] = useState(false); // heart on the Nails Geek hero
  const [liked, setLiked] = useState({}); // hearts on the venue cards, by id
  const [toast, setToast] = useState('');

  const toastTimer = useRef(null);

  // -- actions ---------------------------------------------------------------
  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const callVenue = () => Linking.openURL(`tel:${VENUE.phone}`);

  const getDirections = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        VENUE.address
      )}`
    );

  const goBack = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      showToast("There's no previous screen to go back to");
    }
  };

  const shareVenue = async () => {
    const text = `${VENUE.name} - ${VENUE.address}`;
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title: VENUE.name, text, url: window.location.href });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Link copied');
        }
      } else {
        await Share.share({ message: text });
      }
    } catch (e) {
      // the person closed the share sheet, or sharing isn't available here
    }
  };

  const toggleSaved = () => {
    setSaved((s) => !s);
    showToast(saved ? 'Removed from favourites' : 'Saved to favourites');
  };

  const toggleLike = (venue) => {
    const now = !liked[venue.id];
    setLiked((l) => ({ ...l, [venue.id]: now }));
    showToast(now ? `Saved ${venue.name}` : `Removed ${venue.name}`);
  };

  const claimBusiness = () =>
    Linking.openURL(
      `mailto:?subject=${encodeURIComponent(`Claim business: ${VENUE.name}`)}`
    );

  const emailMe = () => {
    setNotify(true);
    showToast("We'll email you when it's available");
  };

  // The desktop design has no venue cards, so this opens a maps search for
  // similar venues nearby. Swap it for your own "similar venues" page later.
  const findSimilar = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${VENUE.type} near ${VENUE.address}`
      )}`
    );

  const shared = {
    liked,
    toggleLike,
    saved,
    toggleSaved,
    shareVenue,
    goBack,
    callVenue,
    getDirections,
    claimBusiness,
  };

  return (
    <View style={styles.outer}>
      <View style={[styles.screen, isDesktop && styles.screenWide]}>
        <StatusBar hidden />

        <ScrollView
          showsVerticalScrollIndicator={isDesktop}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {isDesktop ? (
            <DesktopLayout
              winWidth={winWidth}
              findSimilar={findSimilar}
              {...shared}
            />
          ) : (
            <MobileLayout
              winWidth={winWidth}
              notify={notify}
              emailMe={emailMe}
              {...shared}
            />
          )}
        </ScrollView>
      </View>

      {/* Small message at the bottom after an action */}
      {!!toast && (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Mobile layout (the left frame in Figma)
// ---------------------------------------------------------------------------
function MobileLayout({
  winWidth,
  notify,
  emailMe,
  liked,
  toggleLike,
  saved,
  toggleSaved,
  shareVenue,
  goBack,
  callVenue,
  getDirections,
  claimBusiness,
}) {
  // Image sizes are worked out in numbers (instead of aspectRatio) because the
  // browser otherwise keeps each picture's own pixel height and stretches it.
  const screenW = Math.min(winWidth, 480); // same max width as the screen
  const scale = screenW / 393; // everything in Figma is drawn 393 wide
  const heroH = 303 * scale; // hero is 393 x 303 in Figma
  const mapW = screenW - 40; // 20px padding on each side
  const mapH = (mapW * 260) / 353; // map picture is 353 x 260 in Figma

  return (
    <>
      {/* Hero: the photo + real back / share / heart buttons on top */}
      <View style={{ width: screenW, height: heroH }}>
        <Image
          source={IMAGES.hero}
          style={{ width: screenW, height: heroH }}
          resizeMode="cover"
        />

        <View style={[styles.heroBtn, { left: 20 }]}>
          <RoundButton icon="arrow-back" label="Go back" onPress={goBack} />
        </View>
        <View style={[styles.heroBtn, { right: 68 }]}>
          <RoundButton icon="share-social-outline" label="Share" onPress={shareVenue} />
        </View>
        <View style={[styles.heroBtn, { right: 20 }]}>
          <RoundButton
            icon="heart-outline"
            label={saved ? 'Remove from favourites' : 'Save to favourites'}
            active={saved}
            onPress={toggleSaved}
          />
        </View>

        {/* "Claim business" is still part of the picture: invisible tap area on top */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Claim business"
          onPress={claimBusiness}
          style={{
            position: 'absolute',
            left: 254 * scale,
            top: 250 * scale,
            width: 119 * scale,
            height: 35.5 * scale,
          }}
        />
      </View>

      <View style={styles.body}>
        {/* Title, location pill, notice, buttons */}
        <View>
          <Text style={styles.title}>{VENUE.name}</Text>
          <Text style={styles.category}>{VENUE.category}</Text>

          <View style={styles.locationPill}>
            <Ionicons name="location-sharp" size={18} color={theme.black} />
            <Text style={styles.locationText}>{VENUE.distance}</Text>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>{VENUE.area}</Text>
          </View>

          <Text style={styles.notice}>{VENUE.notice}</Text>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={callVenue}
          >
            <Text style={styles.primaryBtnText}>Call venue</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={emailMe}
          >
            <Text style={styles.secondaryBtnText}>
              {notify ? "We'll email you when it's available" : 'Email me when available'}
            </Text>
          </Pressable>
        </View>

        {/* Similar venues */}
        <View style={styles.section}>
          <SectionTitle>Similar venues you may like</SectionTitle>
          <VenueList data={SIMILAR} liked={liked} onToggleLike={toggleLike} />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <SectionTitle>Services</SectionTitle>
          <Text style={styles.bodyText}>{VENUE.services}</Text>
        </View>

        {/* Map (the exported image has the address baked in at the bottom,
            so we crop to just the map part) */}
        <View style={styles.section}>
          <View style={styles.mapWrap}>
            <Image
              source={IMAGES.map}
              style={{ width: mapW, height: mapH }}
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
          <VenueList data={NEARBY} liked={liked} onToggleLike={toggleLike} />
        </View>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// Desktop layout (the web frame in Figma): header, breadcrumbs, big title,
// then a wide left column and a sticky "Not available" card on the right.
// ---------------------------------------------------------------------------
function DesktopLayout({
  winWidth,
  findSimilar,
  saved,
  toggleSaved,
  shareVenue,
  callVenue,
  getDirections,
  claimBusiness,
}) {
  const pageW = Math.min(winWidth - 80, 1200); // 40px side padding, 1200 max
  const sideW = 360; // right card
  const gap = 32;
  const mainW = pageW - sideW - gap;

  // The hero photo is shown as a wide band (about 3.2:1). We use the middle of
  // the picture, which has the sign and none of the "Claim business" pill.
  const heroH = mainW / 3.2;
  const imgScale = mainW / 786; // source picture is 786 x 606
  const bandTop = 215; // source px where the band starts
  const mapH = mainW / 2.6;
  const mapImgH = mainW * (260 / 353);

  // "There's more to explore" card. Sizes are fractions of the column width,
  // measured from the Figma web frame, so it scales on smaller laptops.
  const qrCardH = Math.max(mainW * 0.316, 150);
  const qrSize = Math.max(Math.min(mainW * 0.19, 150), 84);
  const phoneW = Math.max(mainW * 0.215, 90); // phone picture is 190 x 412 in Figma
  const phoneH = phoneW * (412.39 / 190.22);
  const phoneRight = mainW * 0.065;
  const phoneTop = mainW * 0.025;

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View style={{ width: pageW }}>
        {/* Header */}
        <View style={styles.dHeader}>
          <Text style={styles.dLogo}>self vibe</Text>
          <View style={styles.dHeaderRight}>
            <Text style={styles.dHeaderLink}>List your business</Text>
            <View style={styles.dAvatarRow}>
              <View style={styles.dAvatar}>
                <Text style={styles.dAvatarText}>A</Text>
              </View>
              <Ionicons name="chevron-down" size={14} color={theme.black} />
            </View>
          </View>
        </View>

        {/* Breadcrumbs */}
        <Text style={styles.dCrumbs}>
          Home · {VENUE.type} · Accra · <Text style={{ color: theme.black }}>{VENUE.name}</Text>
        </Text>

        {/* Title row */}
        <View style={styles.dTitleRow}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.dTitle}>{VENUE.name}</Text>
            <View style={styles.dSubRow}>
              <Text style={styles.dSub}>{VENUE.type}</Text>
              <View style={styles.dDot} />
              <Text style={styles.dSub}>{VENUE.city}</Text>
              <Pressable onPress={getDirections}>
                <Text style={[styles.dSub, styles.dLinkText]}>Get directions</Text>
              </Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <RoundButton icon="share-social-outline" label="Share" onPress={shareVenue} outlined />
            <RoundButton
              icon="heart-outline"
              label={saved ? 'Remove from favourites' : 'Save to favourites'}
              active={saved}
              onPress={toggleSaved}
              outlined
            />
          </View>
        </View>

        {/* Two columns */}
        <View style={styles.dColumns}>
          {/* Left / main */}
          <View style={{ width: mainW }}>
            <View
              style={{
                width: mainW,
                height: heroH,
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: theme.placeholder,
              }}
            >
              <Image
                source={IMAGES.hero}
                style={{
                  width: mainW,
                  height: 606 * imgScale,
                  marginTop: -bandTop * imgScale,
                }}
                resizeMode="cover"
              />
            </View>

            {/* About this venue */}
            <View style={[styles.dBlock, styles.dAboutRow]}>
              <View>
                <Text style={styles.dH2}>About this venue</Text>
                <Text style={styles.dBody}>Coming soon!</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={claimBusiness}
                style={({ pressed }) => [styles.dClaim, pressed && styles.pressed]}
              >
                <Text style={styles.dClaimText}>Claim business</Text>
              </Pressable>
            </View>

            {/* Scan the QR code */}
            <View
              style={[
                styles.dBlock,
                styles.dQrCard,
                // minHeight (not a fixed height) so the text is never cut off on
                // narrower laptops; the card grows when the text needs more room
                { minHeight: qrCardH, paddingVertical: 20 },
              ]}
            >
              {/* soft purple glow behind the phone */}
              {IMAGES.phone && (
                <View
                  pointerEvents="none"
                  style={[
                    styles.dGlow,
                    {
                      right: phoneRight + phoneW * 0.1,
                      top: qrCardH * 0.22,
                      width: phoneW * 0.8,
                      height: qrCardH * 0.5,
                    },
                  ]}
                />
              )}

              {/* QR code: your exported picture, or an icon until you add it */}
              {IMAGES.qr ? (
                <Image
                  source={IMAGES.qr}
                  style={{ width: qrSize, height: qrSize, borderRadius: 12 }}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.dQrBox, { width: qrSize, height: qrSize }]}>
                  <Ionicons name="qr-code-outline" size={qrSize * 0.7} color={theme.black} />
                </View>
              )}

              <View
                style={{
                  flex: 1,
                  paddingRight: IMAGES.phone ? phoneW + phoneRight + 16 : 0,
                }}
              >
                <Text style={styles.dQrTitle}>There's more to explore</Text>
                <Text style={styles.dQrText}>
                  Scan the QR code to discover countless more venues like this one with our app
                </Text>
              </View>

              {/* phone picture on the right; the card cuts off its bottom */}
              {IMAGES.phone && (
                <Image
                  source={IMAGES.phone}
                  style={{
                    position: 'absolute',
                    right: phoneRight,
                    top: phoneTop,
                    width: phoneW,
                    height: phoneH,
                  }}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Services */}
            <View style={styles.dBlock}>
              <Text style={styles.dH2}>Services</Text>
              <Text style={styles.dBody}>{VENUE.services}</Text>
            </View>

            {/* Map */}
            <View style={styles.dBlock}>
              <View
                style={{
                  width: mainW,
                  height: mapH,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: theme.placeholder,
                }}
              >
                <Image
                  source={IMAGES.map}
                  style={{ width: mainW, height: mapImgH }}
                  resizeMode="cover"
                />
              </View>
              <View style={[styles.dSubRow, { marginTop: 12 }]}>
                <Text style={styles.dSub}>{VENUE.address}</Text>
                <Pressable onPress={getDirections}>
                  <Text style={[styles.dSub, styles.dLinkText]}>Get directions</Text>
                </Pressable>
              </View>
            </View>

            {/* Additional information */}
            <View style={styles.dBlock}>
              <Text style={styles.dH2}>Additional information</Text>
              <Pressable style={styles.dInfoRow} onPress={callVenue}>
                <Ionicons name="call-outline" size={18} color={theme.purple} />
                <Text style={[styles.dBody, { color: theme.purple }]}>{VENUE.phoneLabel}</Text>
              </Pressable>
              <View style={styles.dInfoRow}>
                <Ionicons name="location-outline" size={18} color={theme.black} />
                <Text style={styles.dBody}>{VENUE.city}</Text>
              </View>
            </View>
          </View>

          {/* Right / sticky card */}
          <View style={[{ width: sideW }, styles.dSticky]}>
            <View style={styles.dCard}>
              <Text style={styles.dCardTitle}>Not available on Self Vibe</Text>
              <Text style={styles.dCardText}>{VENUE.notice}</Text>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.primaryBtn, { marginTop: 24 }, pressed && styles.pressed]}
                onPress={callVenue}
              >
                <Text style={styles.primaryBtnText}>Call venue</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                onPress={findSimilar}
              >
                <Text style={styles.secondaryBtnText}>Find similar venue</Text>
              </Pressable>

              <Text style={styles.dCardSmall}>
                Is this your venue?{' '}
                <Text style={styles.dLinkText} onPress={claimBusiness}>
                  Claim business
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles. Mobile numbers come from Figma: 393 wide frame, 20px side padding
// (content is 353), hero 393x303, 42px between sections.
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // On a phone this fills the screen. On a laptop (web) the mobile layout is a
  // centered phone-sized column; on wide screens the desktop layout takes over.
  outer: { flex: 1, alignItems: 'center', backgroundColor: '#F2F2F2' },
  screen: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: theme.white },
  screenWide: { maxWidth: '100%' },

  pressed: { opacity: 0.7 },

  // Hero buttons (mobile)
  heroBtn: { position: 'absolute', top: 20 },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnOutlined: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
  },

  body: { paddingHorizontal: 20, paddingTop: 28 },

  title: { fontSize: 26, lineHeight: 32, fontWeight: '700', color: theme.black },
  category: { fontSize: 14, color: theme.muted, marginTop: 6 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    // From the Figma panel: fill #F9F9F9, 12 radius, 1px border (black at 2%),
    // 10 padding, 8 gap, 45 tall.
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    padding: 10,
    minHeight: 45,
    marginTop: 18,
    gap: 8,
  },
  locationText: { fontSize: 14, fontWeight: '500', color: theme.black },
  locationDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.black },
  notice: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: theme.black,
    marginTop: 28,
  },

  primaryBtn: {
    height: 48,
    borderRadius: 999,
    backgroundColor: theme.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  primaryBtnText: { color: theme.white, fontSize: 15, fontWeight: '600' },
  secondaryBtn: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  secondaryBtnText: { color: theme.black, fontSize: 15, fontWeight: '500' },

  section: { marginTop: 42 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.black,
    marginBottom: 14,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: theme.black,
  },

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
    marginTop: 12,
  },
  cardNameLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  cardName: { fontSize: 13, fontWeight: '600', color: theme.black },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  cardMeta: { fontSize: 12, lineHeight: 17, color: theme.muted, marginTop: 4 },

  mapWrap: { width: '100%', height: 197, borderRadius: 12, overflow: 'hidden' },
  address: { fontSize: 14, fontWeight: '500', color: theme.black, marginTop: 12 },
  link: { fontSize: 14, color: theme.purple, marginTop: 4 },

  divider: { height: 1, backgroundColor: theme.border, marginTop: 24 },

  // Message at the bottom
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 28,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toast: {
    backgroundColor: 'rgba(17,17,17,0.92)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  toastText: { color: theme.white, fontSize: 14, fontWeight: '500' },

  // ---- Desktop ----
  dHeader: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dLogo: { fontSize: 30, fontWeight: '700', letterSpacing: -1, color: theme.black },
  dHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dHeaderLink: { fontSize: 14, fontWeight: '500', color: theme.black },
  dAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Round purple "A" like the profile picture in the Figma header
  dAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEEBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dAvatarText: { color: theme.purple, fontSize: 14, fontWeight: '700' },
  dCrumbs: { fontSize: 13, color: theme.muted, marginTop: 24 },
  dTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 24,
  },
  dTitle: { fontSize: 44, lineHeight: 52, fontWeight: '700', color: theme.black },
  dSubRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  dSub: { fontSize: 15, fontWeight: '500', color: theme.black },
  dDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.black },
  dLinkText: { color: theme.purple },

  dColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: 32 },
  dBlock: { marginTop: 40 },
  dAboutRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  dH2: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: theme.black },
  dBody: { fontSize: 15, lineHeight: 24, fontWeight: '500', color: theme.black, marginTop: 8 },
  dClaim: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dClaimText: { color: theme.white, fontSize: 13, fontWeight: '600' },

  dQrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    backgroundColor: theme.surface,
    borderRadius: 20,
    paddingHorizontal: 24,
    overflow: 'hidden', // cuts off the bottom of the phone picture
  },
  dGlow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(91,69,245,0.25)',
    boxShadow: '0 0 60px 40px rgba(91,69,245,0.25)',
  },
  dQrBox: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dQrTitle: { fontSize: 20, fontWeight: '700', color: theme.black },
  dQrText: { fontSize: 15, lineHeight: 23, fontWeight: '500', color: theme.black, marginTop: 8 },

  dInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },

  // Right card stays in view while you scroll (web only)
  dSticky: Platform.OS === 'web' ? { position: 'sticky', top: 24 } : {},
  dCard: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    padding: 24,
    backgroundColor: theme.white,
  },
  dCardTitle: { fontSize: 18, fontWeight: '700', color: theme.black },
  dCardText: { fontSize: 14, lineHeight: 22, fontWeight: '500', color: theme.black, marginTop: 12 },
  dCardSmall: { fontSize: 13, color: theme.muted, marginTop: 20 },
});