import { useCallback, useEffect, useState } from "react";
import { Box, Heading, Text, VStack, Spinner, Card } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { campaignController } from "@modules/campaigns/business";
import type { DeliveryStatsItem } from "@/types/campaign";
import { HOME_MESSAGES } from "@/constants/messages";
const CHART_COLORS = [
  "var(--chakra-colors-blue-500)",
  "var(--chakra-colors-blue-400)",
  "var(--chakra-colors-cyan-500)",
  "var(--chakra-colors-teal-500)",
  "var(--chakra-colors-green-500)",
  "var(--chakra-colors-emerald-500)",
  "var(--chakra-colors-indigo-400)",
  "var(--chakra-colors-violet-400)",
  "var(--chakra-colors-purple-400)",
  "var(--chakra-colors-fuchsia-400)",
];

export function HomeScreen(): React.ReactNode {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topCampaigns, setTopCampaigns] = useState<DeliveryStatsItem[]>([]);

  const loadChartData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await campaignController.getDeliveryStats({ limit: 10 });
    setLoading(false);
    if (!result.success || !result.data) {
      setError(HOME_MESSAGES.chartError);
      setTopCampaigns([]);
      return;
    }
    setTopCampaigns(result.data.items);
  }, []);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const chartData = topCampaigns.map((c) => ({
    name: c.name.length > 28 ? c.name.slice(0, 26) + "…" : c.name,
    fullName: c.name,
    delivery_count: c.delivery_count,
  }));

  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Heading size="lg">{HOME_MESSAGES.title}</Heading>
        <Text color="gray.600" mt={1}>
          {HOME_MESSAGES.welcome}
        </Text>
      </Box>

      <Card.Root
        bg="white"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        overflow="hidden"
        boxShadow="sm"
      >
        <Card.Header
          pb={2}
          borderBottomWidth="1px"
          borderColor="gray.100"
          bg="gray.50"
        >
          <Heading size="md">{HOME_MESSAGES.chartTitle}</Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            {HOME_MESSAGES.chartSubtitle}
          </Text>
        </Card.Header>
        <Card.Body p={6}>
          {loading ? (
            <Box py={12} display="flex" justifyContent="center" alignItems="center">
              <Spinner size="lg" color="blue.500" />
              <Text ml={3} color="gray.600">
                {HOME_MESSAGES.chartLoading}
              </Text>
            </Box>
          ) : error ? (
            <Text color="red.600">{error}</Text>
          ) : chartData.length === 0 ? (
            <Text color="gray.500">{HOME_MESSAGES.chartEmpty}</Text>
          ) : (
            <Box w="100%" h="400px" minH="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chakra-colors-gray-200)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    dataKey="delivery_count"
                    name={HOME_MESSAGES.deliveryCount}
                    tick={{ fontSize: 12, fill: "var(--chakra-colors-gray-600)" }}
                    axisLine={{ stroke: "var(--chakra-colors-gray-300)" }}
                    tickLine={{ stroke: "var(--chakra-colors-gray-300)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 12, fill: "var(--chakra-colors-gray-700)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--chakra-colors-gray-200)",
                      boxShadow: "md",
                    }}
                    labelStyle={{ fontWeight: 600 }}
                    cursor={{ fill: "var(--chakra-colors-gray-100)" }}
                  />
                  <Bar
                    dataKey="delivery_count"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={32}
                    label={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
