// src/screens/BuyPage.js
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const shopAds = [
  // ---- Guys ----
  {
    id: "m1",
    gender: "man",
    title: "Clean streetwear – hoodie + jeans + sneakers",
    description:
      "Grå hoodie, svarta jeans och vita sneakers för en clean vardagslook.",
    link:
      "https://www.zalando.se/klader/?q=gr%C3%A5%20hoodie%20svarta%20jeans%20vita%20sneakers",
  },
  {
    id: "m2",
    gender: "man",
    title: "Smart casual – vit t‑shirt, kavaj & svarta jeans",
    description:
      "Vit t‑shirt med mörk kavaj och slim svarta jeans – funkar både kontor och dejt.",
    link:
      "https://www.zalando.se/man-klader-overdelar/?q=vit%20t-shirt%20kavaj%20svarta%20jeans",
  },
  {
    id: "m3",
    gender: "man",
    title: "All‑black tech – oversized tee, cargo & sneakers",
    description:
      "Svart oversize t‑shirt, svarta cargobyxor och chunky sneakers.",
    link:
      "https://www.zalando.se/klader/?q=svart%20oversized%20t-shirt%20cargo%20sneakers%20herr",
  },
  {
    id: "m4",
    gender: "man",
    title: "Beige set – hoodie + joggers",
    description:
      "Matchat beige set med hoodie och joggers – mjuk men stilren outfit.",
    link:
      "https://www.zalando.se/klader/?q=beige%20hoodie%20joggers%20herr",
  },
  {
    id: "m5",
    gender: "man",
    title: "Premium basic – svart piké, chinos & loafers",
    description:
      "Svart piké, sandfärgade chinos och loafers för en clean premiumlook.",
    link:
      "https://www.zalando.se/klader/?q=svart%20pik%C3%A9%20chinos%20loafers%20herr",
  },

  // ---- Girls ----
  {
    id: "w1",
    gender: "kvinna",
    title: "Everyday denim – jeans + vit tee + sneakers",
    description:
      "Blå raka jeans, vit t‑shirt och vita sneakers – tidlös vardagsstil.",
    link:
      "https://www.zalando.se/klader/?q=bl%C3%A5%20jeans%20vit%20t-shirt%20vita%20sneakers%20dam",
  },
  {
    id: "w2",
    gender: "kvinna",
    title: "Dress + sneakers – casual chic",
    description:
      "Kort klänning med vita sneakers för en bekväm men snygg look.",
    link: "https://www.zalando.se/klader/?q=kl%C3%A4nning%20vita%20sneakers",
  },
  {
    id: "w3",
    gender: "kvinna",
    title: "All white – set + chunky sneakers",
    description:
      "Vitt set och chunky sneakers – perfekt för IG‑bilder och brunch.",
    link:
      "https://www.zalando.se/klader/?q=vitt%20set%20chunky%20sneakers%20dam",
  },
  {
    id: "w4",
    gender: "kvinna",
    title: "Blazer fit – oversized blazer + jeans + boots",
    description:
      "Oversized blazer, straight jeans och svarta boots för city‑vibe.",
    link:
      "https://www.zalando.se/klader/?q=oversized%20blazer%20jeans%20boots%20dam",
  },
  {
    id: "w5",
    gender: "kvinna",
    title: "Sporty set – leggings + cropped hoodie + sneakers",
    description:
      "Svarta leggings, cropped hoodie och sneakers för gym/vardag.",
    link:
      "https://www.zalando.se/klader/?q=leggings%20cropped%20hoodie%20sneakers%20dam",
  },
];

export default function BuyPage() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.tag}>
        {item.gender === "man" ? "For him" : "For her"}
      </Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => Linking.openURL(item.link)}
      >
        <Text style={styles.buttonText}>Shop this look</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Shop now</Text>
      <Text style={styles.subheader}>
        Curated looks direkt från Zalando – klicka för att öppna outfiten.
      </Text>
      <FlatList
        data={shopAds}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  subheader: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});
