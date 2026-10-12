import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Club, PendingClub } from "./types";
import { Icon } from "./cp-icon";

export function PanelHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Stack sx={{ mb: 2 }}>
      <Typography
        sx={{
          color: "#9a9c99",
          fontFamily: '"DM Mono", monospace',
          fontSize: 10,
          letterSpacing: 1.3,
          mb: 1.25,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Typography>
      <Typography variant="h2" sx={{ fontSize: 18 }}>
        {title}
      </Typography>
    </Stack>
  );
}

export function Metric({
  title,
  value,
  change,
  warning = false,
}: {
  title: string;
  value: string;
  change: string;
  warning?: boolean;
}) {
  return (
    <Card
      sx={{
        bgcolor: "#151928",
        color: "#fff",
        minHeight: 182,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardContent sx={{ p: "21px 23px !important" }}>
        <Typography sx={{ color: "#a2a9b9", fontSize: 11, fontWeight: 700 }}>
          {title}
          <Typography
            component="span"
            sx={{
              border: "1px solid",
              borderColor: "#3b4255",
              borderRadius: "50%",
              float: "right",
              fontSize: 11,
              height: 20,
              lineHeight: "17px",
              textAlign: "center",
              width: 20,
            }}
          >
            ↗
          </Typography>
        </Typography>
        <Typography sx={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.5, mt: 2.25 }}>
          {value}
        </Typography>
        <Typography
          sx={{
            color: warning ? "#e59f00" : "#16b67b",
            fontFamily: '"DM Mono", monospace',
            fontSize: 10,
            mt: 0.4,
          }}
        >
          {change}{" "}
          <Typography
            component="span"
            sx={{ color: "#9c9f9d", fontFamily: "inherit", fontSize: "inherit", ml: 0.4 }}
          >
            vs last month
          </Typography>
        </Typography>
        <Stack
          direction="row"
          alignItems="end"
          spacing={0.4}
          sx={{ bottom: 21, height: 33, opacity: 0.7, position: "absolute", right: 23, width: 72 }}
        >
          {[30, 42, 35, 61, 52, 76, 100].map((height, index) => (
            <i
              key={index}
              style={{
                background: warning ? "#e8a900" : "#22df9b",
                borderRadius: "2px 2px 0 0",
                flex: 1,
                height: `${height}%`,
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ApprovalRow({
  club,
  approve,
  decline,
}: {
  club: PendingClub;
  approve: (id: string) => void;
  decline: (id: string) => void;
}) {
  const canApprove = Object.values(club.checks).every(Boolean);
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ borderBottom: 1, borderColor: "#f0f0ed", py: 2 }}
    >
      <Stack>
        <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{club.name}</Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 10, mt: 0.5 }}>
          {club.category} · submitted by {club.submittedBy} · {club.submittedAgo}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.9} sx={{ mt: 1.25 }}>
          {Object.entries(club.checks).map(([name, passed]) => (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.3}
              key={name}
              sx={{
                color: passed ? "#14a875" : "#d99500",
                fontFamily: '"DM Mono", monospace',
                fontSize: 8,
              }}
            >
              <Icon name={passed ? "check" : "chevron"} />
              {name}
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={0.9}>
        <button
          className="round-action approve"
          disabled={!canApprove}
          onClick={() => approve(club.id)}
          aria-label={`Approve ${club.name}`}
        >
          <Icon name="check" />
        </button>
        <button
          className="round-action decline"
          onClick={() => decline(club.id)}
          aria-label={`Decline ${club.name}`}
        >
          <Icon name="x" />
        </button>
      </Stack>
    </Stack>
  );
}

export function Status({ status }: { status: Club["status"] }) {
  return (
    <Stack
      component="span"
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        color: status === "active" ? "#14a875" : "#d99500",
        fontFamily: '"DM Mono", monospace',
        fontSize: 9,
      }}
    >
      <i
        style={{
          background: status === "active" ? "#22df9b" : "#FFB800",
          borderRadius: "50%",
          height: 6,
          width: 6,
        }}
      />
      {status.replace("_", " ")}
    </Stack>
  );
}
