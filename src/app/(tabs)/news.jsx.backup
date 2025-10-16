import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  TrendingUp,
  Clock,
  ExternalLink,
  Play,
  Users,
  Trophy,
  Calendar,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert("Updated", "News feed has been refreshed!");
    }, 2000);
  };

  const handleFixturesPress = () => {
    Alert.alert(
      "Fixtures",
      "View all upcoming football fixtures and schedules.",
      [{ text: "OK" }],
    );
  };

  const handleNewsPress = (article) => {
    Alert.alert(
      article.title,
      `Category: ${article.category}\n\n${article.summary}\n\nWould you like to read the full article?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Read More",
          onPress: () => {
            // In a real app, this would open the article URL
            Alert.alert(
              "Opening Article",
              "This would open the full article in a web browser.",
            );
          },
        },
      ],
    );
  };

  const handleLiveScorePress = (match) => {
    const status = match.isLive ? "Live" : match.status;
    const score =
      match.homeScore !== null && match.awayScore !== null
        ? `${match.homeScore} - ${match.awayScore}`
        : "Not started";

    Alert.alert(
      `${match.homeTeam} vs ${match.awayTeam}`,
      `Competition: ${match.competition}\nStatus: ${status}\nScore: ${score}`,
      [{ text: "OK" }],
    );
  };

  const liveScores = [
    {
      id: 1,
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      homeScore: 2,
      awayScore: 1,
      status: "85'",
      isLive: true,
      competition: "Premier League",
    },
    {
      id: 2,
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      homeScore: 0,
      awayScore: 3,
      status: "FT",
      isLive: false,
      competition: "Premier League",
    },
    {
      id: 3,
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      homeScore: null,
      awayScore: null,
      status: "19:30",
      isLive: false,
      competition: "La Liga",
    },
  ];

  const newsArticles = [
    {
      id: 1,
      title: "Transfer Window: Top 10 Moves That Shaped Football",
      summary:
        "A comprehensive look at the most significant transfers this season and their impact on the game.",
      image:
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
      publishedAt: "2 hours ago",
      category: "Transfer News",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "Champions League Quarter-Finals: Preview and Predictions",
      summary:
        "Breaking down the upcoming quarter-final matches and what to expect from Europe's elite clubs.",
      image:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      publishedAt: "4 hours ago",
      category: "Champions League",
      readTime: "7 min read",
    },
    {
      id: 3,
      title: "Youth Academy Success Stories: Rising Stars to Watch",
      summary:
        "Meet the young talents making waves in professional football and their journey from academy to first team.",
      image:
        "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop",
      publishedAt: "6 hours ago",
      category: "Youth Football",
      readTime: "4 min read",
    },
    {
      id: 4,
      title: "Women's Football World Cup: Road to the Finals",
      summary:
        "Analyzing the tournament progression and standout performances as we approach the championship match.",
      image:
        "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop",
      publishedAt: "8 hours ago",
      category: "Women's Football",
      readTime: "6 min read",
    },
  ];

  const renderLiveScore = (match) => (
    <TouchableOpacity
      key={match.id}
      onPress={() => handleLiveScorePress(match)}
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        minWidth: 280,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Competition & Status */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter_500Medium",
            color: isDark ? "#9CA3AF" : "#6B7280",
          }}
        >
          {match.competition}
        </Text>
        <View
          style={{
            backgroundColor: match.isLive
              ? "#FF6B0020"
              : isDark
                ? "#0A0A0A"
                : "#F8F9FA",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {match.isLive && <Play size={10} color="#FF6B00" />}
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_600SemiBold",
              color: match.isLive ? "#FF6B00" : isDark ? "#9CA3AF" : "#6B7280",
              marginLeft: match.isLive ? 4 : 0,
            }}
          >
            {match.status}
          </Text>
        </View>
      </View>

      {/* Match */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Home Team */}
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            {match.homeTeam}
          </Text>
        </View>

        {/* Score */}
        <View
          style={{
            backgroundColor: "#00FF8820",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            marginHorizontal: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_700Bold",
              color: "#00FF88",
              textAlign: "center",
            }}
          >
            {match.homeScore !== null && match.awayScore !== null
              ? `${match.homeScore} - ${match.awayScore}`
              : "VS"}
          </Text>
        </View>

        {/* Away Team */}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            {match.awayTeam}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNewsArticle = (article, isFirst = false) => (
    <TouchableOpacity
      key={article.id}
      onPress={() => handleNewsPress(article)}
      style={{
        backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: "hidden",
      }}
    >
      {isFirst && (
        <Image
          source={{ uri: article.image }}
          style={{ width: "100%", height: 200 }}
          contentFit="cover"
        />
      )}

      <View style={{ padding: 16 }}>
        {!isFirst && (
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <Image
              source={{ uri: article.image }}
              style={{ width: 80, height: 60, borderRadius: 8 }}
              contentFit="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: "#00FF88",
                    marginRight: 8,
                  }}
                >
                  {article.category}
                </Text>
                <Clock size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                    marginLeft: 4,
                  }}
                >
                  {article.publishedAt}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  lineHeight: 20,
                }}
                numberOfLines={2}
              >
                {article.title}
              </Text>
            </View>
          </View>
        )}

        {isFirst && (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_500Medium",
                  color: "#00FF88",
                  marginRight: 8,
                }}
              >
                {article.category}
              </Text>
              <Clock size={12} color={isDark ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  marginLeft: 4,
                }}
              >
                {article.publishedAt}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_700Bold",
                color: isDark ? "#FFFFFF" : "#000000",
                lineHeight: 26,
                marginBottom: 8,
              }}
            >
              {article.title}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#9CA3AF" : "#6B7280",
                lineHeight: 20,
                marginBottom: 12,
              }}
            >
              {article.summary}
            </Text>
          </>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#9CA3AF" : "#6B7280",
            }}
          >
            {article.readTime}
          </Text>
          <TouchableOpacity
            onPress={() => handleNewsPress(article)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#00FF8820",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_500Medium",
                color: "#00FF88",
                marginRight: 4,
              }}
            >
              Read More
            </Text>
            <ExternalLink size={12} color="#00FF88" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <TrendingUp size={24} color="#00FF88" />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 28,
              fontFamily: "Inter_700Bold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Football News
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#9CA3AF" : "#6B7280",
          }}
        >
          Latest scores and breaking news
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Live Scores Section */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Live Scores
            </Text>
            <TouchableOpacity
              onPress={handleFixturesPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#00FF8820",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Calendar size={14} color="#00FF88" />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#00FF88",
                }}
              >
                Fixtures
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
          >
            {liveScores.map(renderLiveScore)}
          </ScrollView>
        </View>

        {/* Quick Stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View
            style={{
              backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 16,
              }}
            >
              Today's Stats
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#00FF8820",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Play size={20} color="#00FF88" />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  23
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  Live Matches
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#0066FF20",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Trophy size={20} color="#0066FF" />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  156
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  Goals Scored
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#8B5CF620",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Users size={20} color="#8B5CF6" />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  2.4M
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  Fans Watching
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* News Articles */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Latest News
            </Text>
          </View>

          {newsArticles.map((article, index) =>
            renderNewsArticle(article, index === 0),
          )}
        </View>
      </ScrollView>
    </View>
  );
}
