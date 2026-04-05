import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { hostTheme } from "@digi/design-tokens";
import {
  analyticsRangeOptions,
  buildCatalogImportTemplateCsv,
  canArchiveSpace,
  canDeleteSpace,
  describeImportStatus,
  getBrandNameForSpace,
  getPrimaryHostSpace,
  hostFontOptions,
  spaceModeOptions,
  spaceTypeOptions,
  teamRoleOptions,
  type SpaceMode,
  type SpaceType,
  type TeamRole,
} from "@digi/domain";

import { AppButton } from "../src/components/app-button";
import { ChoiceChip } from "../src/components/choice-chip";
import { PageShell } from "../src/components/page-shell";
import { TextField } from "../src/components/text-field";
import { useHostApp } from "../src/host-app-context";

const primaryColorPresets = ["#1A1714", "#2563EB", "#7C2D12", "#166534"];
const secondaryColorPresets = ["#F8F6F1", "#F6F1EB", "#FFF7ED", "#F0FDF4"];

export default function OperationsScreen() {
  const {
    busy,
    createBrand,
    createNewSpace,
    archiveSpaceById,
    assignBrandToSpace,
    deleteSpaceById,
    error,
    inviteTeamAccess,
    operations,
    operationsRange,
    refreshOperations,
    removeTeamAccessEntry,
    setup,
    submitCatalogImport,
  } = useHostApp();
  const [notice, setNotice] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("Campaign Brand");
  const [brandPrimaryColor, setBrandPrimaryColor] = useState(primaryColorPresets[1]);
  const [brandSecondaryColor, setBrandSecondaryColor] = useState(secondaryColorPresets[0]);
  const [brandFont, setBrandFont] = useState<(typeof hostFontOptions)[number]>(hostFontOptions[1]);
  const [inviteName, setInviteName] = useState("Maya Kapoor");
  const [invitePhone, setInvitePhone] = useState("+91 90000 11223");
  const [inviteRole, setInviteRole] = useState<TeamRole>(teamRoleOptions[2]?.value ?? "operator");
  const [spaceName, setSpaceName] = useState("West Zone Pop-Up");
  const [spaceBrandId, setSpaceBrandId] = useState(setup?.brandProfiles[0]?.id ?? "");
  const [spaceType, setSpaceType] = useState<SpaceType>(spaceTypeOptions[0]?.value ?? "store");
  const [spaceMode, setSpaceMode] = useState<SpaceMode>(spaceModeOptions[0]?.value ?? "identified");
  const [spaceDuration, setSpaceDuration] = useState("60");
  const [importFileName, setImportFileName] = useState("catalog-import.csv");
  const defaultSpace = getPrimaryHostSpace(setup);
  const defaultBrand = setup?.brandProfiles.find((brand) => brand.isDefault) ?? setup?.brandProfiles[0];
  const [importCsv, setImportCsv] = useState(
    buildCatalogImportTemplateCsv(defaultSpace?.name ?? "Dealer Day", defaultBrand?.name ?? "Primary Brand"),
  );

  useEffect(() => {
    if (!operations) {
      void refreshOperations();
    }
  }, [operations, refreshOperations]);

  useEffect(() => {
    if (!spaceBrandId && setup?.brandProfiles[0]?.id) {
      setSpaceBrandId(setup.brandProfiles[0].id);
    }
  }, [setup, spaceBrandId]);

  const latestImport = operations?.importJobs[0] ?? null;
  const templateCsv = useMemo(
    () => buildCatalogImportTemplateCsv(defaultSpace?.name ?? "Dealer Day", defaultBrand?.name ?? "Primary Brand"),
    [defaultBrand?.name, defaultSpace?.name],
  );

  async function handleDownloadTemplate() {
    setNotice("Template shared.");

    if (typeof window !== "undefined") {
      const blob = new Blob([templateCsv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "digi-import-template.csv";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    await Share.share({
      title: "Digi import template",
      message: templateCsv,
    });
  }

  async function handleCreateBrand() {
    await createBrand({
      name: brandName,
      primaryColor: brandPrimaryColor,
      secondaryColor: brandSecondaryColor,
      fontFamily: brandFont,
      makeDefault: false,
    });
    setNotice("Brand profile created.");
    setBrandName("Field Activation");
  }

  async function handleCreateSpace() {
    await createNewSpace({
      name: spaceName,
      brandProfileId: spaceBrandId,
      defaultSessionDurationMinutes: Number(spaceDuration) || 60,
      mode: spaceMode,
      spaceType,
    });
    setNotice("Space created.");
    setSpaceName("South Zone Meet-Up");
  }

  async function handleInviteTeam() {
    await inviteTeamAccess({
      displayName: inviteName,
      phone: invitePhone,
      role: inviteRole,
    });
    setNotice("Team invite sent.");
  }

  async function handleSubmitImport() {
    await submitCatalogImport({
      fileName: importFileName,
      csvText: importCsv,
      spaceId: defaultSpace?.id ?? null,
    });
    setNotice("Import validation recorded.");
  }

  if (!setup?.account) {
    return (
      <PageShell
        description="Finish account setup before using analytics, team, and import tooling."
        eyebrow="M4 Operations"
        footer={<AppButton label="Back to dashboard" onPress={() => router.replace("/dashboard")} variant="secondary" />}
        title="Operations unavailable"
      >
        <Text style={styles.emptyCopy}>Complete the M2 setup flow first. Operations unlock after the workspace has an account, brand, and active space.</Text>
      </PageShell>
    );
  }

  return (
    <PageShell
      description="Run the business beyond one manual room: monitor analytics, validate imports, manage team access, and control brands and spaces."
      eyebrow="M4 Operations"
      footer={
        <View style={{ gap: 12 }}>
          <AppButton label="Refresh operations" onPress={() => void refreshOperations()} />
          <AppButton label="Back to dashboard" onPress={() => router.replace("/dashboard")} variant="secondary" />
        </View>
      }
      title="Operations"
    >
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Analytics</Text>
        <Text style={styles.sectionTitle}>Pilot health</Text>
        <View style={styles.chipRow}>
          {analyticsRangeOptions.map((range) => (
            <ChoiceChip
              key={range.value}
              label={range.label}
              onPress={() => void refreshOperations(range.value)}
              selected={operationsRange === range.value}
            />
          ))}
        </View>
        <View style={styles.metricsRow}>
          <MetricCard label="Sessions" value={String(operations?.analytics.sessionCount ?? 0)} />
          <MetricCard label="Views" value={String(operations?.analytics.totalViews ?? 0)} />
          <MetricCard label="Saves" value={String(operations?.analytics.totalSaves ?? 0)} />
        </View>
        <View style={styles.metricsRow}>
          <MetricCard label="Attendees" value={String(operations?.analytics.attendeeCount ?? 0)} />
          <MetricCard label="Active spaces" value={String(operations?.analytics.activeSpaces ?? 0)} />
          <MetricCard label="Save rate" value={String(operations?.analytics.saveRate ?? 0)} />
        </View>
        <View style={styles.listCard}>
          <Text style={styles.listLabel}>Top spaces</Text>
          {operations?.analytics.topSpaces.length ? (
            operations.analytics.topSpaces.map((space) => (
              <View key={space.spaceId} style={styles.listRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.listTitle}>{space.spaceName}</Text>
                  <Text style={styles.listMeta}>
                    {space.sessionCount} sessions · {space.attendeeCount} attendees
                  </Text>
                </View>
                <Text style={styles.listMetric}>{space.totalSaves} saves</Text>
              </View>
            ))
          ) : (
            <Text style={styles.listEmpty}>No session history yet for this range.</Text>
          )}
        </View>
        <View style={styles.listCard}>
          <Text style={styles.listLabel}>Top content</Text>
          {operations?.analytics.topContent.length ? (
            operations.analytics.topContent.map((item) => (
              <View key={item.contentId} style={styles.listRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listMeta}>{item.views} views</Text>
                </View>
                <Text style={styles.listMetric}>{item.saves} saves</Text>
              </View>
            ))
          ) : (
            <Text style={styles.listEmpty}>Top content will populate after the first live sessions end.</Text>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Imports</Text>
        <Text style={styles.sectionTitle}>CSV validation</Text>
        <Text style={styles.sectionCopy}>
          Use the template, paste the CSV, and log the validation result. The current pilot path supports CSV and records row-level outcomes.
        </Text>
        <TextField
          label="File name"
          onChangeText={setImportFileName}
          placeholder="catalog-import.csv"
          value={importFileName}
        />
        <TextField
          label="CSV payload"
          multiline
          numberOfLines={8}
          onChangeText={setImportCsv}
          placeholder="space_name,brand_name,content_type,title,subtitle,sku"
          value={importCsv}
        />
        <View style={{ gap: 10 }}>
          <AppButton label="Validate and record import" onPress={() => void handleSubmitImport()} disabled={busy} />
          <AppButton label="Download template" onPress={() => void handleDownloadTemplate()} variant="secondary" />
        </View>
        {latestImport ? (
          <View style={styles.listCard}>
            <Text style={styles.listLabel}>Latest import</Text>
            <Text style={styles.listTitle}>
              {latestImport.fileName} · {describeImportStatus(latestImport.status)}
            </Text>
            <Text style={styles.listMeta}>
              {latestImport.acceptedRows}/{latestImport.processedRows} accepted · {latestImport.rejectedRows} rejected
            </Text>
            {latestImport.rows.slice(0, 4).map((row) => (
              <View key={`${latestImport.id}-${row.rowNumber}`} style={styles.rowAudit}>
                <Text style={styles.rowAuditLabel}>Row {row.rowNumber}</Text>
                <Text style={styles.rowAuditCopy}>{row.message}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Team</Text>
        <Text style={styles.sectionTitle}>Access and roles</Text>
        <TextField label="Invite name" onChangeText={setInviteName} value={inviteName} />
        <TextField label="Invite phone" keyboardType="phone-pad" onChangeText={setInvitePhone} value={invitePhone} />
        <View style={styles.chipRow}>
          {teamRoleOptions.filter((option) => option.value !== "owner").map((role) => (
            <ChoiceChip
              key={role.value}
              label={role.label}
              onPress={() => setInviteRole(role.value)}
              selected={inviteRole === role.value}
            />
          ))}
        </View>
        <AppButton label="Send invite" onPress={() => void handleInviteTeam()} disabled={busy} />
        <View style={styles.listCard}>
          <Text style={styles.listLabel}>Active team</Text>
          {operations?.teamMembers.map((member) => (
            <View key={member.id} style={styles.listRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.listTitle}>{member.displayName}</Text>
                <Text style={styles.listMeta}>
                  {member.role} · {member.phone}
                </Text>
              </View>
              {member.role === "owner" ? (
                <Text style={styles.lockedLabel}>Locked</Text>
              ) : (
                <InlineAction label="Remove" onPress={() => void removeTeamAccessEntry({ memberId: member.id })} />
              )}
            </View>
          ))}
        </View>
        <View style={styles.listCard}>
          <Text style={styles.listLabel}>Pending invites</Text>
          {operations?.teamInvites.length ? (
            operations.teamInvites.map((invite) => (
              <View key={invite.id} style={styles.listRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.listTitle}>{invite.displayName}</Text>
                  <Text style={styles.listMeta}>
                    {invite.role} · {invite.phone} · {invite.status}
                  </Text>
                </View>
                {invite.status === "pending" ? (
                  <InlineAction label="Revoke" onPress={() => void removeTeamAccessEntry({ inviteId: invite.id })} />
                ) : (
                  <Text style={styles.lockedLabel}>Closed</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.listEmpty}>No pending invites.</Text>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Brands</Text>
        <Text style={styles.sectionTitle}>Multi-brand setup</Text>
        <TextField label="Brand name" onChangeText={setBrandName} value={brandName} />
        <View style={styles.chipRow}>
          {primaryColorPresets.map((color) => (
            <ChoiceChip
              key={color}
              label={color}
              onPress={() => setBrandPrimaryColor(color)}
              selected={brandPrimaryColor === color}
            />
          ))}
        </View>
        <View style={styles.chipRow}>
          {secondaryColorPresets.map((color) => (
            <ChoiceChip
              key={color}
              label={color}
              onPress={() => setBrandSecondaryColor(color)}
              selected={brandSecondaryColor === color}
            />
          ))}
        </View>
        <View style={styles.chipRow}>
          {hostFontOptions.map((font) => (
            <ChoiceChip
              key={font}
              label={font}
              onPress={() => setBrandFont(font)}
              selected={brandFont === font}
            />
          ))}
        </View>
        <AppButton label="Create brand profile" onPress={() => void handleCreateBrand()} disabled={busy} />
        <View style={styles.listCard}>
          <Text style={styles.listLabel}>Brand profiles</Text>
          {setup.brandProfiles.map((brand) => (
            <View key={brand.id} style={styles.listRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.listTitle}>{brand.name}</Text>
                <Text style={styles.listMeta}>
                  {brand.fontFamily} · {brand.primaryColor} / {brand.secondaryColor}
                </Text>
              </View>
              {brand.isDefault ? <Text style={styles.lockedLabel}>Default</Text> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Spaces</Text>
        <Text style={styles.sectionTitle}>Archive, delete, and assign brands</Text>
        <TextField label="Space name" onChangeText={setSpaceName} value={spaceName} />
        <View style={styles.chipRow}>
          {setup.brandProfiles.map((brand) => (
            <ChoiceChip
              key={brand.id}
              label={brand.name}
              onPress={() => setSpaceBrandId(brand.id)}
              selected={spaceBrandId === brand.id}
            />
          ))}
        </View>
        <View style={styles.chipRow}>
          {spaceTypeOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              onPress={() => setSpaceType(option.value)}
              selected={spaceType === option.value}
            />
          ))}
        </View>
        <View style={styles.chipRow}>
          {spaceModeOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              onPress={() => setSpaceMode(option.value)}
              selected={spaceMode === option.value}
            />
          ))}
        </View>
        <TextField
          label="Default session minutes"
          keyboardType="numeric"
          onChangeText={setSpaceDuration}
          value={spaceDuration}
        />
        <AppButton label="Create space" onPress={() => void handleCreateSpace()} disabled={busy || !spaceBrandId} />
        {setup.spaces.map((space) => (
          <View key={space.id} style={styles.spaceCard}>
            <View style={styles.listRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.listTitle}>{space.name}</Text>
                <Text style={styles.listMeta}>
                  {space.spaceType} · {space.mode} · {space.defaultSessionDurationMinutes} min
                </Text>
                <Text style={styles.listMeta}>{getBrandNameForSpace(setup.brandProfiles, space)}</Text>
              </View>
              {space.archivedAt ? <Text style={styles.archivedLabel}>Archived</Text> : space.isDefault ? <Text style={styles.lockedLabel}>Default</Text> : null}
            </View>
            <View style={styles.chipRow}>
              {setup.brandProfiles.map((brand) => (
                <ChoiceChip
                  key={`${space.id}-${brand.id}`}
                  label={brand.name}
                  onPress={() => void assignBrandToSpace(space.id, brand.id)}
                  selected={space.brandProfileId === brand.id}
                />
              ))}
            </View>
            <View style={styles.inlineActions}>
              <InlineAction
                disabled={space.archivedAt !== null || !canArchiveSpace(setup.spaces, space.id)}
                label="Archive"
                onPress={() => void archiveSpaceById(space.id)}
              />
              <InlineAction
                disabled={!canDeleteSpace(setup.spaces, space.id)}
                label="Delete"
                onPress={() => void deleteSpaceById(space.id)}
              />
            </View>
          </View>
        ))}
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </PageShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function InlineAction({
  disabled = false,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.inlineAction,
        disabled ? styles.inlineActionDisabled : null,
        pressed && !disabled ? { opacity: 0.82 } : null,
      ]}
    >
      <Text style={styles.inlineActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: hostTheme.colors.paper,
    borderRadius: hostTheme.radius.card,
    gap: 12,
    padding: hostTheme.spacing.md,
  },
  sectionLabel: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: hostTheme.colors.ink,
    fontSize: 24,
    fontWeight: "700",
  },
  sectionCopy: {
    color: hostTheme.colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    backgroundColor: hostTheme.colors.paperMuted,
    borderRadius: 16,
    flex: 1,
    gap: 4,
    padding: hostTheme.spacing.sm,
  },
  metricValue: {
    color: hostTheme.colors.ink,
    fontSize: 26,
    fontWeight: "700",
  },
  metricLabel: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderColor: hostTheme.colors.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: hostTheme.spacing.sm,
  },
  listLabel: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  listRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  listTitle: {
    color: hostTheme.colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  listMeta: {
    color: hostTheme.colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  listMetric: {
    color: hostTheme.colors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  listEmpty: {
    color: hostTheme.colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  rowAudit: {
    borderTopColor: hostTheme.colors.line,
    borderTopWidth: 1,
    gap: 4,
    paddingTop: 10,
  },
  rowAuditLabel: {
    color: hostTheme.colors.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  rowAuditCopy: {
    color: hostTheme.colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  spaceCard: {
    backgroundColor: "#FFFFFF",
    borderColor: hostTheme.colors.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: hostTheme.spacing.sm,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 10,
  },
  inlineAction: {
    backgroundColor: hostTheme.colors.paperMuted,
    borderRadius: hostTheme.radius.chip,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inlineActionDisabled: {
    opacity: 0.45,
  },
  inlineActionLabel: {
    color: hostTheme.colors.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  lockedLabel: {
    color: hostTheme.colors.blue,
    fontSize: 12,
    fontWeight: "700",
  },
  archivedLabel: {
    color: hostTheme.colors.amber,
    fontSize: 12,
    fontWeight: "700",
  },
  notice: {
    color: "#BBF7D0",
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: "#FCA5A5",
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCopy: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 22,
  },
});
