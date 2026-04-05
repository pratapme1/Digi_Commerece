// ignore_for_file: sort_child_properties_last

import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import 'src/demo_window_bridge.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DigiHostApp());
}

class DigiHostApp extends StatefulWidget {
  const DigiHostApp({super.key});

  @override
  State<DigiHostApp> createState() => _DigiHostAppState();
}

class _DigiHostAppState extends State<DigiHostApp> {
  late final HostAppController controller;

  @override
  void initState() {
    super.initState();
    controller = HostAppController(
      config: HostAppConfig.fromEnvironment(),
      bridge: createDemoWindowBridge(),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Digi Host',
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF184A8B),
              brightness: Brightness.dark,
            ),
            scaffoldBackgroundColor: const Color(0xFF09101D),
            useMaterial3: true,
          ),
          home: Scaffold(
            backgroundColor: Colors.transparent,
            body: HostScaffold(controller: controller),
          ),
        );
      },
    );
  }
}

class HostScaffold extends StatelessWidget {
  const HostScaffold({super.key, required this.controller});

  final HostAppController controller;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF09101D),
            Color(0xFF111B30),
            Color(0xFF17243C),
          ],
        ),
      ),
      child: SafeArea(
        child: Align(
          alignment: Alignment.topCenter,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1080),
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 36),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (controller.notice != null) ...[
                    NoticeBanner(message: controller.notice!, onDismiss: controller.clearNotice),
                    const SizedBox(height: 16),
                  ],
                  if (controller.error != null) ...[
                    ErrorBanner(message: controller.error!, onDismiss: controller.clearError),
                    const SizedBox(height: 16),
                  ],
                  _buildScreen(context),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildScreen(BuildContext context) {
    switch (controller.route) {
      case HostRoute.welcome:
        return WelcomeScreen(controller: controller);
      case HostRoute.accountSetup:
        return AccountSetupScreen(controller: controller);
      case HostRoute.brandSetup:
        return BrandSetupScreen(controller: controller);
      case HostRoute.spaceSetup:
        return SpaceSetupScreen(controller: controller);
      case HostRoute.qr:
        return QrScreen(controller: controller);
      case HostRoute.dashboard:
        return DashboardScreen(controller: controller);
      case HostRoute.goLive:
        return GoLiveScreen(controller: controller);
      case HostRoute.livePanel:
        return LivePanelScreen(controller: controller);
      case HostRoute.sessionSummary:
        return SessionSummaryScreen(controller: controller);
      case HostRoute.operations:
        return OperationsScreen(controller: controller);
    }
  }
}

enum HostRoute {
  welcome,
  accountSetup,
  brandSetup,
  spaceSetup,
  qr,
  dashboard,
  goLive,
  livePanel,
  sessionSummary,
  operations,
}

enum SpaceType {
  businessCard('business_card', 'Business Card', 'Contact-led room'),
  store('store', 'Store', 'Product and offer room'),
  restaurant('restaurant', 'Restaurant', 'Menu-led room');

  const SpaceType(this.value, this.label, this.summary);

  final String value;
  final String label;
  final String summary;
}

enum SpaceMode {
  identified('identified', 'Identified'),
  anonymous('anonymous', 'Anonymous');

  const SpaceMode(this.value, this.label);

  final String value;
  final String label;
}

enum SessionStatus {
  draft('draft'),
  scheduled('scheduled'),
  live('live'),
  ending('ending'),
  ended('ended');

  const SessionStatus(this.value);

  final String value;
}

enum TeamRole {
  owner('owner', 'Owner'),
  admin('admin', 'Admin'),
  operator('operator', 'Operator'),
  analyst('analyst', 'Analyst');

  const TeamRole(this.value, this.label);

  final String value;
  final String label;
}

enum AnalyticsRange {
  sevenDays('7d', '7 days'),
  thirtyDays('30d', '30 days'),
  allTime('all', 'All time');

  const AnalyticsRange(this.value, this.label);

  final String value;
  final String label;
}

class HostAppConfig {
  const HostAppConfig({
    required this.attendeeBaseUrl,
  });

  final String attendeeBaseUrl;

  factory HostAppConfig.fromEnvironment() {
    const preferred = String.fromEnvironment('EXPO_PUBLIC_ATTENDEE_BASE_URL', defaultValue: '');
    const fallback = String.fromEnvironment('ATTENDEE_BASE_URL', defaultValue: 'http://127.0.0.1:4100/s');
    final fromEnv = preferred.isNotEmpty ? preferred : fallback;
    return HostAppConfig(attendeeBaseUrl: fromEnv);
  }
}

class HostSetupDraft {
  const HostSetupDraft({
    required this.businessName,
    required this.brandName,
    required this.primaryColor,
    required this.secondaryColor,
    required this.fontFamily,
    required this.spaceName,
    required this.spaceType,
    required this.mode,
    required this.defaultSessionDurationMinutes,
  });

  final String businessName;
  final String brandName;
  final String primaryColor;
  final String secondaryColor;
  final String fontFamily;
  final String spaceName;
  final SpaceType spaceType;
  final SpaceMode mode;
  final int defaultSessionDurationMinutes;

  HostSetupDraft copyWith({
    String? businessName,
    String? brandName,
    String? primaryColor,
    String? secondaryColor,
    String? fontFamily,
    String? spaceName,
    SpaceType? spaceType,
    SpaceMode? mode,
    int? defaultSessionDurationMinutes,
  }) {
    return HostSetupDraft(
      businessName: businessName ?? this.businessName,
      brandName: brandName ?? this.brandName,
      primaryColor: primaryColor ?? this.primaryColor,
      secondaryColor: secondaryColor ?? this.secondaryColor,
      fontFamily: fontFamily ?? this.fontFamily,
      spaceName: spaceName ?? this.spaceName,
      spaceType: spaceType ?? this.spaceType,
      mode: mode ?? this.mode,
      defaultSessionDurationMinutes: defaultSessionDurationMinutes ?? this.defaultSessionDurationMinutes,
    );
  }
}

const defaultHostSetupDraft = HostSetupDraft(
  businessName: '',
  brandName: 'Primary Brand',
  primaryColor: '#184A8B',
  secondaryColor: '#F6F0E8',
  fontFamily: 'DM Sans',
  spaceName: '',
  spaceType: SpaceType.store,
  mode: SpaceMode.identified,
  defaultSessionDurationMinutes: 60,
);

class HostAccount {
  const HostAccount({
    required this.id,
    required this.ownerUserId,
    required this.businessName,
    required this.verificationTier,
    required this.primaryPhone,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String ownerUserId;
  final String businessName;
  final String verificationTier;
  final String primaryPhone;
  final DateTime createdAt;
  final DateTime updatedAt;
}

class HostBrandProfile {
  const HostBrandProfile({
    required this.id,
    required this.accountId,
    required this.name,
    required this.primaryColor,
    required this.secondaryColor,
    required this.fontFamily,
    required this.isDefault,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String accountId;
  final String name;
  final String primaryColor;
  final String secondaryColor;
  final String fontFamily;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime updatedAt;
}

class HostSpace {
  const HostSpace({
    required this.id,
    required this.accountId,
    required this.brandProfileId,
    required this.name,
    required this.spaceType,
    required this.mode,
    required this.qrSlug,
    required this.defaultSessionDurationMinutes,
    required this.isDefault,
    required this.archivedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String accountId;
  final String brandProfileId;
  final String name;
  final SpaceType spaceType;
  final SpaceMode mode;
  final String qrSlug;
  final int defaultSessionDurationMinutes;
  final bool isDefault;
  final DateTime? archivedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  HostSpace copyWith({
    String? brandProfileId,
    DateTime? archivedAt,
    bool? isDefault,
  }) {
    return HostSpace(
      id: id,
      accountId: accountId,
      brandProfileId: brandProfileId ?? this.brandProfileId,
      name: name,
      spaceType: spaceType,
      mode: mode,
      qrSlug: qrSlug,
      defaultSessionDurationMinutes: defaultSessionDurationMinutes,
      isDefault: isDefault ?? this.isDefault,
      archivedAt: archivedAt ?? this.archivedAt,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}

class HostSession {
  const HostSession({
    required this.id,
    required this.spaceId,
    required this.status,
    required this.durationMinutes,
    required this.startedAt,
    required this.endsAt,
    required this.endedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String spaceId;
  final SessionStatus status;
  final int durationMinutes;
  final DateTime? startedAt;
  final DateTime? endsAt;
  final DateTime? endedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  HostSession copyWith({
    SessionStatus? status,
    DateTime? endsAt,
    DateTime? endedAt,
    DateTime? updatedAt,
  }) {
    return HostSession(
      id: id,
      spaceId: spaceId,
      status: status ?? this.status,
      durationMinutes: durationMinutes,
      startedAt: startedAt,
      endsAt: endsAt ?? this.endsAt,
      endedAt: endedAt ?? this.endedAt,
      createdAt: createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
    );
  }
}

class HostSetupSnapshot {
  const HostSetupSnapshot({
    required this.account,
    required this.brandProfiles,
    required this.spaces,
    required this.liveSession,
  });

  final HostAccount account;
  final List<HostBrandProfile> brandProfiles;
  final List<HostSpace> spaces;
  final HostSession? liveSession;

  HostSetupSnapshot copyWith({
    HostAccount? account,
    List<HostBrandProfile>? brandProfiles,
    List<HostSpace>? spaces,
    HostSession? liveSession,
    bool clearLiveSession = false,
  }) {
    return HostSetupSnapshot(
      account: account ?? this.account,
      brandProfiles: brandProfiles ?? this.brandProfiles,
      spaces: spaces ?? this.spaces,
      liveSession: clearLiveSession ? null : liveSession ?? this.liveSession,
    );
  }
}

class SpaceContentEntry {
  const SpaceContentEntry({
    required this.id,
    required this.spaceId,
    required this.source,
    required this.contentType,
    required this.title,
    required this.subtitle,
    required this.sku,
    required this.collectionId,
    required this.screen,
    required this.cardId,
    required this.productIndex,
    required this.rank,
    required this.metadata,
  });

  final String id;
  final String? spaceId;
  final String source;
  final String contentType;
  final String title;
  final String subtitle;
  final String? sku;
  final String collectionId;
  final String screen;
  final String cardId;
  final int? productIndex;
  final int rank;
  final Map<String, dynamic> metadata;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'spaceId': spaceId,
      'source': source,
      'contentType': contentType,
      'title': title,
      'subtitle': subtitle,
      'sku': sku,
      'collectionId': collectionId,
      'screen': screen,
      'cardId': cardId,
      'productIndex': productIndex,
      'rank': rank,
      'metadata': metadata,
    };
  }
}

class LiveContentItem {
  const LiveContentItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.collectionId,
    required this.screen,
    required this.cardId,
    required this.productIndex,
  });

  final String id;
  final String title;
  final String subtitle;
  final String collectionId;
  final String screen;
  final String cardId;
  final int? productIndex;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'collectionId': collectionId,
      'screen': screen,
      'cardId': cardId,
      'productIndex': productIndex,
    };
  }
}

class LivePresenceEntry {
  const LivePresenceEntry({
    required this.attendeeRef,
    required this.attendeeName,
    required this.joinedAt,
    required this.lastSeenAt,
  });

  final String attendeeRef;
  final String? attendeeName;
  final DateTime joinedAt;
  final DateTime lastSeenAt;

  LivePresenceEntry copyWith({
    String? attendeeName,
    DateTime? lastSeenAt,
  }) {
    return LivePresenceEntry(
      attendeeRef: attendeeRef,
      attendeeName: attendeeName ?? this.attendeeName,
      joinedAt: joinedAt,
      lastSeenAt: lastSeenAt ?? this.lastSeenAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'attendeeRef': attendeeRef,
      'attendeeName': attendeeName,
      'joinedAt': joinedAt.toIso8601String(),
      'lastSeenAt': lastSeenAt.toIso8601String(),
    };
  }
}

class LiveActivityEvent {
  const LiveActivityEvent({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.attendeeRef,
    required this.attendeeName,
    required this.contentId,
    required this.contentTitle,
  });

  final String id;
  final String name;
  final DateTime createdAt;
  final String? attendeeRef;
  final String? attendeeName;
  final String? contentId;
  final String? contentTitle;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'createdAt': createdAt.toIso8601String(),
      'attendeeRef': attendeeRef,
      'attendeeName': attendeeName,
      'contentId': contentId,
      'contentTitle': contentTitle,
    };
  }
}

class LiveMetricsSnapshot {
  const LiveMetricsSnapshot({
    required this.attendeeCount,
    required this.peakAttendeeCount,
    required this.totalViews,
    required this.totalSaves,
    required this.saveRate,
  });

  final int attendeeCount;
  final int peakAttendeeCount;
  final int totalViews;
  final int totalSaves;
  final double saveRate;
}

class TopContentMetric {
  const TopContentMetric({
    required this.contentId,
    required this.title,
    required this.views,
    required this.saves,
  });

  final String contentId;
  final String title;
  final int views;
  final int saves;
}

class SessionSummarySnapshot {
  const SessionSummarySnapshot({
    required this.sessionId,
    required this.status,
    required this.startedAt,
    required this.endedAt,
    required this.durationMinutes,
    required this.metrics,
    required this.topContent,
    required this.shareText,
  });

  final String sessionId;
  final SessionStatus status;
  final DateTime? startedAt;
  final DateTime? endedAt;
  final int durationMinutes;
  final LiveMetricsSnapshot metrics;
  final List<TopContentMetric> topContent;
  final String shareText;
}

class LivePanelSnapshot {
  const LivePanelSnapshot({
    required this.sessionId,
    required this.spaceId,
    required this.qrSlug,
    required this.status,
    required this.startedAt,
    required this.endsAt,
    required this.endedAt,
    required this.pinnedItem,
    required this.attendees,
    required this.recentAttendees,
    required this.metrics,
    required this.summary,
  });

  final String sessionId;
  final String spaceId;
  final String qrSlug;
  final SessionStatus status;
  final DateTime? startedAt;
  final DateTime? endsAt;
  final DateTime? endedAt;
  final LiveContentItem? pinnedItem;
  final List<LivePresenceEntry> attendees;
  final List<LivePresenceEntry> recentAttendees;
  final LiveMetricsSnapshot metrics;
  final SessionSummarySnapshot? summary;
}

class DemoRoomState {
  const DemoRoomState({
    required this.sessionId,
    required this.spaceId,
    required this.qrSlug,
    required this.spaceName,
    required this.spaceType,
    required this.mode,
    required this.attendeeUrl,
    required this.status,
    required this.startedAt,
    required this.endsAt,
    required this.endedAt,
    required this.durationMinutes,
    required this.pinnedItem,
    required this.contentEntries,
    required this.attendees,
    required this.events,
  });

  final String sessionId;
  final String spaceId;
  final String qrSlug;
  final String spaceName;
  final SpaceType spaceType;
  final SpaceMode mode;
  final String attendeeUrl;
  final SessionStatus status;
  final DateTime? startedAt;
  final DateTime? endsAt;
  final DateTime? endedAt;
  final int durationMinutes;
  final LiveContentItem? pinnedItem;
  final List<SpaceContentEntry> contentEntries;
  final List<LivePresenceEntry> attendees;
  final List<LiveActivityEvent> events;

  DemoRoomState copyWith({
    SessionStatus? status,
    DateTime? endedAt,
    LiveContentItem? pinnedItem,
    bool clearPinned = false,
    List<SpaceContentEntry>? contentEntries,
    List<LivePresenceEntry>? attendees,
    List<LiveActivityEvent>? events,
  }) {
    return DemoRoomState(
      sessionId: sessionId,
      spaceId: spaceId,
      qrSlug: qrSlug,
      spaceName: spaceName,
      spaceType: spaceType,
      mode: mode,
      attendeeUrl: attendeeUrl,
      status: status ?? this.status,
      startedAt: startedAt,
      endsAt: endsAt,
      endedAt: endedAt ?? this.endedAt,
      durationMinutes: durationMinutes,
      pinnedItem: clearPinned ? null : pinnedItem ?? this.pinnedItem,
      contentEntries: contentEntries ?? this.contentEntries,
      attendees: attendees ?? this.attendees,
      events: events ?? this.events,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'spaceId': spaceId,
      'qrSlug': qrSlug,
      'spaceName': spaceName,
      'spaceType': spaceType.value,
      'mode': mode.value,
      'attendeeUrl': attendeeUrl,
      'status': status.value,
      'startedAt': startedAt?.toIso8601String(),
      'endsAt': endsAt?.toIso8601String(),
      'endedAt': endedAt?.toIso8601String(),
      'durationMinutes': durationMinutes,
      'pinnedItem': pinnedItem?.toJson(),
      'contentEntries': contentEntries.map((entry) => entry.toJson()).toList(),
      'attendees': attendees.map((entry) => entry.toJson()).toList(),
      'events': events.map((entry) => entry.toJson()).toList(),
    };
  }
}

class TeamMember {
  const TeamMember({
    required this.id,
    required this.displayName,
    required this.phone,
    required this.role,
    required this.status,
    required this.joinedAt,
    required this.lastActiveAt,
  });

  final String id;
  final String displayName;
  final String phone;
  final TeamRole role;
  final String status;
  final DateTime joinedAt;
  final DateTime? lastActiveAt;
}

class TeamInvite {
  const TeamInvite({
    required this.id,
    required this.displayName,
    required this.phone,
    required this.role,
    required this.status,
    required this.invitedAt,
    required this.respondedAt,
  });

  final String id;
  final String displayName;
  final String phone;
  final TeamRole role;
  final String status;
  final DateTime invitedAt;
  final DateTime? respondedAt;
}

class CatalogImportRowResult {
  const CatalogImportRowResult({
    required this.rowNumber,
    required this.status,
    required this.spaceName,
    required this.brandName,
    required this.contentType,
    required this.title,
    required this.subtitle,
    required this.sku,
    required this.message,
  });

  final int rowNumber;
  final String status;
  final String spaceName;
  final String brandName;
  final String contentType;
  final String title;
  final String subtitle;
  final String sku;
  final String message;
}

class CatalogImportJob {
  const CatalogImportJob({
    required this.id,
    required this.fileName,
    required this.status,
    required this.processedRows,
    required this.acceptedRows,
    required this.rejectedRows,
    required this.createdAt,
    required this.spaceId,
    required this.rows,
  });

  final String id;
  final String fileName;
  final String status;
  final int processedRows;
  final int acceptedRows;
  final int rejectedRows;
  final DateTime createdAt;
  final String? spaceId;
  final List<CatalogImportRowResult> rows;
}

class OperationsSessionRecord {
  const OperationsSessionRecord({
    required this.sessionId,
    required this.spaceId,
    required this.spaceName,
    required this.status,
    required this.startedAt,
    required this.endedAt,
    required this.attendeeCount,
    required this.totalViews,
    required this.totalSaves,
    required this.topContent,
  });

  final String sessionId;
  final String spaceId;
  final String spaceName;
  final SessionStatus status;
  final DateTime? startedAt;
  final DateTime? endedAt;
  final int attendeeCount;
  final int totalViews;
  final int totalSaves;
  final List<TopContentMetric> topContent;
}

class TopSpaceMetric {
  const TopSpaceMetric({
    required this.spaceId,
    required this.spaceName,
    required this.sessionCount,
    required this.attendeeCount,
    required this.totalViews,
    required this.totalSaves,
  });

  final String spaceId;
  final String spaceName;
  final int sessionCount;
  final int attendeeCount;
  final int totalViews;
  final int totalSaves;
}

class OperationsAnalyticsSnapshot {
  const OperationsAnalyticsSnapshot({
    required this.range,
    required this.sessionCount,
    required this.activeSpaces,
    required this.attendeeCount,
    required this.totalViews,
    required this.totalSaves,
    required this.saveRate,
    required this.topSpaces,
    required this.topContent,
    required this.recentSessions,
  });

  final AnalyticsRange range;
  final int sessionCount;
  final int activeSpaces;
  final int attendeeCount;
  final int totalViews;
  final int totalSaves;
  final double saveRate;
  final List<TopSpaceMetric> topSpaces;
  final List<TopContentMetric> topContent;
  final List<OperationsSessionRecord> recentSessions;
}

class OperationsSnapshot {
  const OperationsSnapshot({
    required this.analytics,
    required this.teamMembers,
    required this.teamInvites,
    required this.importJobs,
    required this.sessionHistory,
  });

  final OperationsAnalyticsSnapshot analytics;
  final List<TeamMember> teamMembers;
  final List<TeamInvite> teamInvites;
  final List<CatalogImportJob> importJobs;
  final List<OperationsSessionRecord> sessionHistory;
}

class CatalogValidationResult {
  const CatalogValidationResult({
    required this.status,
    required this.processedRows,
    required this.acceptedRows,
    required this.rejectedRows,
    required this.rows,
  });

  final String status;
  final int processedRows;
  final int acceptedRows;
  final int rejectedRows;
  final List<CatalogImportRowResult> rows;
}

class HostAppController extends ChangeNotifier {
  HostAppController({
    required this.config,
    required DemoWindowBridge bridge,
  }) : _bridge = bridge {
    _bridge.attach(_handleBridgeMessage);
    ready = true;
  }

  final HostAppConfig config;
  final DemoWindowBridge _bridge;
  final Random _random = Random();

  bool ready = false;
  bool busy = false;
  bool authenticated = false;
  bool demoMode = true;
  String? error;
  String? notice;
  HostRoute route = HostRoute.welcome;
  HostSetupDraft draft = defaultHostSetupDraft;
  HostSetupSnapshot? setup;
  LivePanelSnapshot? livePanel;
  SessionSummarySnapshot? sessionSummary;
  AnalyticsRange operationsRange = AnalyticsRange.thirtyDays;
  Map<String, List<SpaceContentEntry>> contentCatalogs = {};
  List<TeamMember> teamMembers = const [];
  List<TeamInvite> teamInvites = const [];
  List<CatalogImportJob> importJobs = const [];
  List<OperationsSessionRecord> sessionHistory = const [];
  DemoRoomState? demoRoomState;

  OperationsSnapshot get operations => OperationsSnapshot(
        analytics: _buildAnalyticsSnapshot(),
        teamMembers: teamMembers,
        teamInvites: teamInvites,
        importJobs: importJobs,
        sessionHistory: sessionHistory,
      );

  HostSpace? get primarySpace {
    final currentSetup = setup;
    if (currentSetup == null) {
      return null;
    }

    final activeSpaces = currentSetup.spaces.where((space) => space.archivedAt == null).toList();
    return activeSpaces.firstWhere(
      (space) => space.isDefault,
      orElse: () => activeSpaces.isNotEmpty ? activeSpaces.first : currentSetup.spaces.first,
    );
  }

  void clearError() {
    error = null;
    notifyListeners();
  }

  void clearNotice() {
    notice = null;
    notifyListeners();
  }

  void startDemoMode() {
    authenticated = true;
    error = null;
    notice = 'Demo workspace is active for the full host walkthrough.';
    route = setup == null ? HostRoute.accountSetup : _resolveSignedInRoute();
    notifyListeners();
  }

  void continueAccountStep({
    required String businessName,
    required SpaceType spaceType,
  }) {
    draft = draft.copyWith(
      businessName: businessName.trim(),
      brandName: draft.brandName == 'Primary Brand' ? businessName.trim() : draft.brandName,
      spaceType: spaceType,
    );
    route = HostRoute.brandSetup;
    notifyListeners();
  }

  void continueBrandStep({
    required String brandName,
    required String primaryColor,
    required String secondaryColor,
    required String fontFamily,
  }) {
    draft = draft.copyWith(
      brandName: brandName.trim(),
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      fontFamily: fontFamily,
    );
    route = HostRoute.spaceSetup;
    notifyListeners();
  }

  void saveSpaceSetup({
    required String spaceName,
    required SpaceMode mode,
    required int durationMinutes,
  }) {
    final now = DateTime.now();
    final nextDraft = draft.copyWith(
      spaceName: spaceName.trim(),
      mode: mode,
      defaultSessionDurationMinutes: durationMinutes,
    );
    final accountId = _createId('account');
    final brandId = _createId('brand');
    final spaceId = _createId('space');
    final qrSlug = _createQrSlug(nextDraft.spaceName.isEmpty ? nextDraft.businessName : nextDraft.spaceName, const []);

    final account = HostAccount(
      id: accountId,
      ownerUserId: _createId('user'),
      businessName: nextDraft.businessName,
      verificationTier: 'phone_verified',
      primaryPhone: '+91 99999 99999',
      createdAt: now,
      updatedAt: now,
    );
    final brand = HostBrandProfile(
      id: brandId,
      accountId: accountId,
      name: nextDraft.brandName,
      primaryColor: nextDraft.primaryColor,
      secondaryColor: nextDraft.secondaryColor,
      fontFamily: nextDraft.fontFamily,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    );
    final space = HostSpace(
      id: spaceId,
      accountId: accountId,
      brandProfileId: brandId,
      name: nextDraft.spaceName,
      spaceType: nextDraft.spaceType,
      mode: nextDraft.mode,
      qrSlug: qrSlug,
      defaultSessionDurationMinutes: nextDraft.defaultSessionDurationMinutes,
      isDefault: true,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    );

    setup = HostSetupSnapshot(
      account: account,
      brandProfiles: [brand],
      spaces: [space],
      liveSession: null,
    );
    draft = nextDraft;
    contentCatalogs = {
      space.id: _createSeedEntries(space.spaceType, space.id),
    };
    teamMembers = [
      TeamMember(
        id: _createId('member'),
        displayName: '${nextDraft.businessName} owner',
        phone: '+91 99999 99999',
        role: TeamRole.owner,
        status: 'active',
        joinedAt: now,
        lastActiveAt: now,
      ),
    ];
    teamInvites = [];
    importJobs = [];
    sessionHistory = [];
    demoRoomState = null;
    livePanel = null;
    sessionSummary = null;
    notice = 'Workspace saved and QR generated.';
    route = HostRoute.qr;
    notifyListeners();
  }

  void openQr() {
    route = HostRoute.qr;
    notifyListeners();
  }

  void openDashboard() {
    route = HostRoute.dashboard;
    notifyListeners();
  }

  void openOperations() {
    route = HostRoute.operations;
    notifyListeners();
  }

  void openGoLive() {
    route = HostRoute.goLive;
    notifyListeners();
  }

  void openLivePanel() {
    route = HostRoute.livePanel;
    notifyListeners();
  }

  void openSessionSummary() {
    route = HostRoute.sessionSummary;
    notifyListeners();
  }

  void signOut() {
    authenticated = false;
    route = HostRoute.welcome;
    error = null;
    notice = 'Signed out of the local workspace.';
    notifyListeners();
  }

  Future<void> launchAttendeeSpace() async {
    final space = primarySpace;
    if (space == null) {
      return;
    }
    final url = _buildAttendeeUrl(space);
    if (await _bridge.openUrl(url)) {
      return;
    }
    await launchUrl(Uri.parse(url), webOnlyWindowName: '_blank');
  }

  Future<void> copyAttendeeLink() async {
    final space = primarySpace;
    if (space == null) {
      return;
    }

    await Clipboard.setData(ClipboardData(text: _buildAttendeeUrl(space)));
    notice = 'Attendee link copied.';
    notifyListeners();
  }

  void goLive(int durationMinutes) {
    final currentSetup = setup;
    final space = primarySpace;
    if (currentSetup == null || space == null) {
      error = 'Finish setup before going live.';
      notifyListeners();
      return;
    }

    final now = DateTime.now();
    final startsAt = now;
    final endsAt = now.add(Duration(minutes: durationMinutes));
    final session = HostSession(
      id: _createId('session'),
      spaceId: space.id,
      status: SessionStatus.live,
      durationMinutes: durationMinutes,
      startedAt: startsAt,
      endsAt: endsAt,
      endedAt: null,
      createdAt: now,
      updatedAt: now,
    );
    setup = currentSetup.copyWith(liveSession: session);
    demoRoomState = DemoRoomState(
      sessionId: session.id,
      spaceId: space.id,
      qrSlug: space.qrSlug,
      spaceName: space.name,
      spaceType: space.spaceType,
      mode: space.mode,
      attendeeUrl: _buildAttendeeUrl(space),
      status: SessionStatus.live,
      startedAt: startsAt,
      endsAt: endsAt,
      endedAt: null,
      durationMinutes: durationMinutes,
      pinnedItem: null,
      contentEntries: _entriesForSpace(space.id),
      attendees: const [],
      events: [
        LiveActivityEvent(
          id: _createId('event'),
          name: 'session_started',
          createdAt: now,
          attendeeRef: null,
          attendeeName: null,
          contentId: null,
          contentTitle: null,
        ),
      ],
    );
    livePanel = _toLivePanel(demoRoomState!);
    sessionSummary = null;
    notice = 'Live session started.';
    route = HostRoute.livePanel;
    _broadcastRoomState();
    notifyListeners();
  }

  void refreshLivePanel() {
    if (demoRoomState != null) {
      livePanel = _toLivePanel(demoRoomState!);
      notifyListeners();
    }
  }

  void pinLiveContent(LiveContentItem content) {
    final room = demoRoomState;
    if (room == null) {
      error = 'Start a live session before pinning content.';
      notifyListeners();
      return;
    }

    final nextRoom = room.copyWith(
      pinnedItem: content,
      events: [
        ...room.events,
        LiveActivityEvent(
          id: _createId('event'),
          name: 'featured_item_changed',
          createdAt: DateTime.now(),
          attendeeRef: null,
          attendeeName: null,
          contentId: content.id,
          contentTitle: content.title,
        ),
      ],
    );
    demoRoomState = nextRoom;
    livePanel = _toLivePanel(nextRoom);
    notice = '${content.title} pinned for attendees.';
    _broadcastRoomState();
    notifyListeners();
  }

  void endLiveSession() {
    final room = demoRoomState;
    final currentSetup = setup;
    if (room == null || currentSetup == null) {
      error = 'No live session is active.';
      notifyListeners();
      return;
    }

    final endedAt = DateTime.now();
    final nextRoom = room.copyWith(
      status: SessionStatus.ended,
      endedAt: endedAt,
      events: [
        ...room.events,
        LiveActivityEvent(
          id: _createId('event'),
          name: 'session_ended',
          createdAt: endedAt,
          attendeeRef: null,
          attendeeName: null,
          contentId: null,
          contentTitle: null,
        ),
      ],
    );
    demoRoomState = nextRoom;
    livePanel = _toLivePanel(nextRoom);
    sessionSummary = livePanel?.summary;
    setup = currentSetup.copyWith(clearLiveSession: true);

    final space = currentSetup.spaces.firstWhere((item) => item.id == room.spaceId);
    if (sessionSummary != null) {
      sessionHistory = [
        OperationsSessionRecord(
          sessionId: sessionSummary!.sessionId,
          spaceId: space.id,
          spaceName: space.name,
          status: sessionSummary!.status,
          startedAt: sessionSummary!.startedAt,
          endedAt: sessionSummary!.endedAt,
          attendeeCount: sessionSummary!.metrics.attendeeCount,
          totalViews: sessionSummary!.metrics.totalViews,
          totalSaves: sessionSummary!.metrics.totalSaves,
          topContent: sessionSummary!.topContent,
        ),
        ...sessionHistory,
      ];
    }

    notice = 'Live session ended and summary recorded.';
    route = HostRoute.sessionSummary;
    _broadcastRoomState();
    notifyListeners();
  }

  void refreshOperations([AnalyticsRange? range]) {
    operationsRange = range ?? operationsRange;
    notifyListeners();
  }

  void createBrand({
    required String name,
    required String primaryColor,
    required String secondaryColor,
    required String fontFamily,
  }) {
    final currentSetup = setup;
    if (currentSetup == null) {
      return;
    }
    final now = DateTime.now();
    final brand = HostBrandProfile(
      id: _createId('brand'),
      accountId: currentSetup.account.id,
      name: name.trim(),
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      fontFamily: fontFamily,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    );
    setup = currentSetup.copyWith(brandProfiles: [...currentSetup.brandProfiles, brand]);
    notice = 'Brand profile created.';
    notifyListeners();
  }

  void createSpace({
    required String name,
    required String brandProfileId,
    required SpaceType spaceType,
    required SpaceMode mode,
    required int durationMinutes,
  }) {
    final currentSetup = setup;
    if (currentSetup == null) {
      return;
    }
    final now = DateTime.now();
    final space = HostSpace(
      id: _createId('space'),
      accountId: currentSetup.account.id,
      brandProfileId: brandProfileId,
      name: name.trim(),
      spaceType: spaceType,
      mode: mode,
      qrSlug: _createQrSlug(name.trim(), currentSetup.spaces),
      defaultSessionDurationMinutes: durationMinutes,
      isDefault: false,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    );
    setup = currentSetup.copyWith(spaces: [...currentSetup.spaces, space]);
    contentCatalogs = {
      ...contentCatalogs,
      space.id: _createSeedEntries(spaceType, space.id),
    };
    notice = 'Space created.';
    notifyListeners();
  }

  void archiveSpace(String spaceId) {
    final currentSetup = setup;
    if (currentSetup == null) {
      return;
    }
    setup = currentSetup.copyWith(
      spaces: currentSetup.spaces.map((space) {
        if (space.id != spaceId) {
          return space;
        }
        return space.copyWith(archivedAt: DateTime.now());
      }).toList(),
    );
    notice = 'Space archived.';
    notifyListeners();
  }

  void deleteSpace(String spaceId) {
    final currentSetup = setup;
    if (currentSetup == null) {
      return;
    }
    setup = currentSetup.copyWith(
      spaces: currentSetup.spaces.where((space) => space.id != spaceId).toList(),
    );
    contentCatalogs = {
      for (final entry in contentCatalogs.entries)
        if (entry.key != spaceId) entry.key: entry.value,
    };
    notice = 'Space deleted.';
    notifyListeners();
  }

  void inviteTeamAccess({
    required String displayName,
    required String phone,
    required TeamRole role,
  }) {
    teamInvites = [
      TeamInvite(
        id: _createId('invite'),
        displayName: displayName.trim(),
        phone: phone.trim(),
        role: role,
        status: 'pending',
        invitedAt: DateTime.now(),
        respondedAt: null,
      ),
      ...teamInvites,
    ];
    notice = 'Team invite sent.';
    notifyListeners();
  }

  void revokeInvite(String inviteId) {
    teamInvites = teamInvites
        .map(
          (invite) => invite.id == inviteId
              ? TeamInvite(
                  id: invite.id,
                  displayName: invite.displayName,
                  phone: invite.phone,
                  role: invite.role,
                  status: 'revoked',
                  invitedAt: invite.invitedAt,
                  respondedAt: DateTime.now(),
                )
              : invite,
        )
        .toList();
    notifyListeners();
  }

  void submitCatalogImport({
    required String fileName,
    required String csvText,
  }) {
    final space = primarySpace;
    final currentSetup = setup;
    if (space == null || currentSetup == null) {
      return;
    }

    final validation = _validateCatalogImportCsv(csvText, currentSetup);
    final job = CatalogImportJob(
      id: _createId('import'),
      fileName: fileName.trim(),
      status: validation.status,
      processedRows: validation.processedRows,
      acceptedRows: validation.acceptedRows,
      rejectedRows: validation.rejectedRows,
      createdAt: DateTime.now(),
      spaceId: space.id,
      rows: validation.rows,
    );

    importJobs = [job, ...importJobs];
    if (validation.acceptedRows > 0) {
      final merged = _mergeImportRowsIntoEntries(space.id, space.spaceType, _entriesForSpace(space.id), validation.rows);
      contentCatalogs = {
        ...contentCatalogs,
        space.id: merged,
      };
      if (demoRoomState != null && demoRoomState!.spaceId == space.id) {
        demoRoomState = demoRoomState!.copyWith(contentEntries: merged);
        livePanel = _toLivePanel(demoRoomState!);
        _broadcastRoomState();
      }
    }

    notice = validation.status == 'validated'
        ? 'Import validated and promoted to attendee content.'
        : validation.status == 'partial'
            ? 'Import recorded with partial acceptance.'
            : 'Import failed validation.';
    notifyListeners();
  }

  @override
  void dispose() {
    _bridge.dispose();
    super.dispose();
  }

  HostRoute _resolveSignedInRoute() {
    final currentSetup = setup;
    if (currentSetup == null) {
      return HostRoute.accountSetup;
    }
    if (currentSetup.liveSession != null && livePanel != null) {
      return HostRoute.livePanel;
    }
    return HostRoute.dashboard;
  }

  Future<Map<String, dynamic>?> _handleBridgeMessage(Map<String, dynamic> message) async {
    final room = demoRoomState;
    final space = primarySpace;
    if (room == null || space == null) {
      return null;
    }

    if (message['room'] != space.qrSlug) {
      return null;
    }

    if (message['type'] == 'digi-demo-room-request') {
      return room.toJson();
    }

    if (message['type'] == 'digi-demo-attendee-presence') {
      final presenceMap = Map<String, dynamic>.from(message['presence'] as Map);
      final presence = LivePresenceEntry(
        attendeeRef: (presenceMap['attendeeRef'] as String?) ?? _createId('attendee'),
        attendeeName: presenceMap['attendeeName'] as String?,
        joinedAt: DateTime.tryParse((presenceMap['joinedAt'] as String?) ?? '') ?? DateTime.now(),
        lastSeenAt: DateTime.tryParse((presenceMap['lastSeenAt'] as String?) ?? '') ?? DateTime.now(),
      );
      final existing = room.attendees.where((entry) => entry.attendeeRef != presence.attendeeRef).toList();
      final nextRoom = room.copyWith(
        attendees: [presence, ...existing],
        events: [
          ...room.events,
          LiveActivityEvent(
            id: _createId('event'),
            name: 'presence_registered',
            createdAt: DateTime.now(),
            attendeeRef: presence.attendeeRef,
            attendeeName: presence.attendeeName,
            contentId: null,
            contentTitle: null,
          ),
        ],
      );
      demoRoomState = nextRoom;
      livePanel = _toLivePanel(nextRoom);
      notifyListeners();
      return nextRoom.toJson();
    }

    if (message['type'] == 'digi-demo-attendee-event') {
      final nextEvent = LiveActivityEvent(
        id: _createId('event'),
        name: (message['eventName'] as String?) ?? 'space_overview_viewed',
        createdAt: DateTime.now(),
        attendeeRef: message['attendeeRef'] as String?,
        attendeeName: message['attendeeName'] as String?,
        contentId: message['contentId'] as String?,
        contentTitle: message['contentTitle'] as String?,
      );
      final nextRoom = room.copyWith(events: [...room.events, nextEvent]);
      demoRoomState = nextRoom;
      livePanel = _toLivePanel(nextRoom);
      notifyListeners();
      return nextRoom.toJson();
    }

    return null;
  }

  LivePanelSnapshot _toLivePanel(DemoRoomState room) {
    final metrics = _summarizeMetrics(room.events, room.attendees);
    final summary = room.status == SessionStatus.ended
        ? _buildSessionSummary(
            sessionId: room.sessionId,
            status: room.status,
            startedAt: room.startedAt,
            endedAt: room.endedAt,
            durationMinutes: room.durationMinutes,
            events: room.events,
            attendees: room.attendees,
          )
        : null;

    return LivePanelSnapshot(
      sessionId: room.sessionId,
      spaceId: room.spaceId,
      qrSlug: room.qrSlug,
      status: room.status,
      startedAt: room.startedAt,
      endsAt: room.endsAt,
      endedAt: room.endedAt,
      pinnedItem: room.pinnedItem,
      attendees: room.attendees,
      recentAttendees: room.attendees.take(6).toList(),
      metrics: metrics,
      summary: summary,
    );
  }

  LiveMetricsSnapshot _summarizeMetrics(List<LiveActivityEvent> events, List<LivePresenceEntry> attendees) {
    final totalViews = events.where((event) => const {
          'space_overview_viewed',
          'collection_opened',
          'search_result_opened',
          'card_viewed',
          'pin_received',
        }.contains(event.name)).length;
    final totalSaves = events.where((event) => const {
          'content_saved',
          'offline_save_queued',
        }.contains(event.name)).length;

    return LiveMetricsSnapshot(
      attendeeCount: attendees.length,
      peakAttendeeCount: attendees.length,
      totalViews: totalViews,
      totalSaves: totalSaves,
      saveRate: totalViews == 0 ? 0 : double.parse((totalSaves / totalViews).toStringAsFixed(2)),
    );
  }

  SessionSummarySnapshot _buildSessionSummary({
    required String sessionId,
    required SessionStatus status,
    required DateTime? startedAt,
    required DateTime? endedAt,
    required int durationMinutes,
    required List<LiveActivityEvent> events,
    required List<LivePresenceEntry> attendees,
  }) {
    final metrics = _summarizeMetrics(events, attendees);
    final byContent = <String, TopContentMetric>{};

    for (final event in events) {
      if (event.contentId == null || event.contentTitle == null) {
        continue;
      }
      final current = byContent[event.contentId!] ??
          TopContentMetric(
            contentId: event.contentId!,
            title: event.contentTitle!,
            views: 0,
            saves: 0,
          );
      final next = TopContentMetric(
        contentId: current.contentId,
        title: current.title,
        views: current.views +
            (const {'collection_opened', 'search_result_opened', 'card_viewed', 'pin_received'}.contains(event.name) ? 1 : 0),
        saves: current.saves + (const {'content_saved', 'offline_save_queued'}.contains(event.name) ? 1 : 0),
      );
      byContent[event.contentId!] = next;
    }

    final topContent = byContent.values.toList()
      ..sort((left, right) {
        if (right.saves != left.saves) {
          return right.saves.compareTo(left.saves);
        }
        return right.views.compareTo(left.views);
      });

    return SessionSummarySnapshot(
      sessionId: sessionId,
      status: status,
      startedAt: startedAt,
      endedAt: endedAt,
      durationMinutes: durationMinutes,
      metrics: metrics,
      topContent: topContent.take(3).toList(),
      shareText:
          'Live session summary: ${metrics.attendeeCount} attendees, ${metrics.totalViews} content views, ${metrics.totalSaves} saves, and ${topContent.isNotEmpty ? topContent.first.title : 'no standout item'} as the top content.',
    );
  }

  OperationsAnalyticsSnapshot _buildAnalyticsSnapshot() {
    final activeSpaces = setup?.spaces.where((space) => space.archivedAt == null).length ?? 0;
    final rangeStart = switch (operationsRange) {
      AnalyticsRange.sevenDays => DateTime.now().subtract(const Duration(days: 7)),
      AnalyticsRange.thirtyDays => DateTime.now().subtract(const Duration(days: 30)),
      AnalyticsRange.allTime => null,
    };
    final filteredSessions = sessionHistory.where((record) {
      if (rangeStart == null) {
        return true;
      }
      final stamp = record.endedAt ?? record.startedAt;
      return stamp != null && !stamp.isBefore(rangeStart);
    }).toList();

    final totalViews = filteredSessions.fold<int>(0, (sum, record) => sum + record.totalViews);
    final totalSaves = filteredSessions.fold<int>(0, (sum, record) => sum + record.totalSaves);
    final attendeeCount = filteredSessions.fold<int>(0, (sum, record) => sum + record.attendeeCount);
    final saveRate = totalViews == 0 ? 0 : double.parse((totalSaves / totalViews).toStringAsFixed(2));

    final topSpacesById = <String, TopSpaceMetric>{};
    final topContentById = <String, TopContentMetric>{};
    for (final record in filteredSessions) {
      final currentSpace = topSpacesById[record.spaceId] ??
          TopSpaceMetric(
            spaceId: record.spaceId,
            spaceName: record.spaceName,
            sessionCount: 0,
            attendeeCount: 0,
            totalViews: 0,
            totalSaves: 0,
          );
      topSpacesById[record.spaceId] = TopSpaceMetric(
        spaceId: currentSpace.spaceId,
        spaceName: currentSpace.spaceName,
        sessionCount: currentSpace.sessionCount + 1,
        attendeeCount: currentSpace.attendeeCount + record.attendeeCount,
        totalViews: currentSpace.totalViews + record.totalViews,
        totalSaves: currentSpace.totalSaves + record.totalSaves,
      );
      for (final item in record.topContent) {
        final currentItem = topContentById[item.contentId] ??
            TopContentMetric(contentId: item.contentId, title: item.title, views: 0, saves: 0);
        topContentById[item.contentId] = TopContentMetric(
          contentId: item.contentId,
          title: item.title,
          views: currentItem.views + item.views,
          saves: currentItem.saves + item.saves,
        );
      }
    }

    final topSpaces = topSpacesById.values.toList()
      ..sort((left, right) {
        if (right.totalSaves != left.totalSaves) {
          return right.totalSaves.compareTo(left.totalSaves);
        }
        return right.totalViews.compareTo(left.totalViews);
      });
    final topContent = topContentById.values.toList()
      ..sort((left, right) {
        if (right.saves != left.saves) {
          return right.saves.compareTo(left.saves);
        }
        return right.views.compareTo(left.views);
      });

    return OperationsAnalyticsSnapshot(
      range: operationsRange,
      sessionCount: filteredSessions.length,
      activeSpaces: activeSpaces,
      attendeeCount: attendeeCount,
      totalViews: totalViews,
      totalSaves: totalSaves,
      saveRate: saveRate.toDouble(),
      topSpaces: topSpaces.take(5).toList(),
      topContent: topContent.take(5).toList(),
      recentSessions: filteredSessions.take(6).toList(),
    );
  }

  List<SpaceContentEntry> _entriesForSpace(String spaceId) {
    return contentCatalogs[spaceId] ?? const [];
  }

  void _broadcastRoomState() {
    final room = demoRoomState;
    if (room == null) {
      return;
    }
    _bridge.broadcastRoomState(room.qrSlug, room.toJson());
  }

  String _createId(String prefix) {
    return '${prefix}_${_random.nextInt(0xFFFFFF).toRadixString(16).padLeft(6, '0')}';
  }

  String _slugify(String value) {
    final normal = value.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-').replaceAll(RegExp(r'^-+|-+$'), '');
    return normal.isEmpty ? 'space' : normal;
  }

  String _createQrSlug(String spaceName, List<HostSpace> spaces) {
    final base = '${_slugify(spaceName)}-demo';
    var candidate = base;
    var suffix = 2;
    while (spaces.any((space) => space.qrSlug == candidate)) {
      candidate = '${_slugify(spaceName)}-$suffix-demo';
      suffix += 1;
    }
    return candidate;
  }

  String _buildAttendeeUrl(HostSpace space) {
    final base = config.attendeeBaseUrl.replaceAll(RegExp(r'/+$'), '');
    final status = demoRoomState?.status ?? (setup?.liveSession?.status ?? SessionStatus.draft);
    final params = <String, String>{
      'demo': '1',
      'room': space.qrSlug,
      'spaceType': space.spaceType.value,
      'mode': space.mode.value,
      'session': switch (status) {
        SessionStatus.live => 'live',
        SessionStatus.ending => 'ending',
        SessionStatus.ended => 'ended',
        _ => 'inactive',
      },
      'spaceName': space.name,
      'brandName': setup?.brandProfiles.first.name ?? draft.brandName,
      'attendees': '${demoRoomState?.attendees.length ?? 0}',
    };
    final pinned = demoRoomState?.pinnedItem;
    if (pinned != null) {
      params.addAll({
        'pinnedId': pinned.id,
        'pinnedTitle': pinned.title,
        'pinnedSubtitle': pinned.subtitle,
        'pinnedCollectionId': pinned.collectionId,
        'pinnedScreen': pinned.screen,
        'pinnedCardId': pinned.cardId,
        if (pinned.productIndex != null) 'pinnedProductIndex': '${pinned.productIndex}',
      });
    }
    return Uri.parse('$base/${space.qrSlug}').replace(queryParameters: params).toString();
  }

  List<SpaceContentEntry> _createSeedEntries(SpaceType type, String spaceId) {
    switch (type) {
      case SpaceType.store:
        return [
          SpaceContentEntry(
            id: 'product-ve-ch03',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'product',
            title: '65W GaN Dual USB-C Charger',
            subtitle: 'Live dealer offer · Charging',
            sku: 'VE-CH03',
            collectionId: 'products',
            screen: 'ps',
            cardId: 'VE-CH03',
            productIndex: 0,
            rank: 0,
            metadata: const {
              'price': '₹899',
              'margin': 'Dealer margin 44%',
            },
          ),
          SpaceContentEntry(
            id: 'product-ve-pad15',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'product',
            title: 'Wireless Charging Pad 15W',
            subtitle: 'Accessory bundle offer',
            sku: 'VE-CH06',
            collectionId: 'products',
            screen: 'ps',
            cardId: 'VE-CH06',
            productIndex: 1,
            rank: 1,
            metadata: const {
              'price': '₹599',
              'margin': 'Dealer margin 41%',
            },
          ),
          SpaceContentEntry(
            id: 'contact-rhea',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'contact',
            title: 'Rhea Sen',
            subtitle: 'Regional sales lead',
            sku: null,
            collectionId: 'contacts',
            screen: 'cs',
            cardId: 'host-contact',
            productIndex: null,
            rank: 2,
            metadata: const {
              'phone': '+91 90000 11223',
              'email': 'rhea@vega.example',
            },
          ),
          SpaceContentEntry(
            id: 'offer-volume-pricing',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'offer',
            title: 'Volume pricing up to 22% off',
            subtitle: 'Dealer spotlight',
            sku: null,
            collectionId: 'live',
            screen: 'ls',
            cardId: 'pricing',
            productIndex: null,
            rank: 3,
            metadata: const {
              'saveTitle': 'Volume pricing offer',
            },
          ),
        ];
      case SpaceType.restaurant:
        return [
          SpaceContentEntry(
            id: 'menu-special',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'menu',
            title: 'Lamb raan with saffron rice',
            subtitle: 'Chef special',
            sku: null,
            collectionId: 'menu',
            screen: 'ms',
            cardId: 'chef-special',
            productIndex: null,
            rank: 0,
            metadata: const {
              'price': '₹980',
              'section': 'Chef special',
            },
          ),
          SpaceContentEntry(
            id: 'menu-tikka',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'menu',
            title: 'Smoked paneer tikka',
            subtitle: 'Small plates',
            sku: null,
            collectionId: 'menu',
            screen: 'ms',
            cardId: 'smoked-paneer',
            productIndex: null,
            rank: 1,
            metadata: const {
              'price': '₹420',
              'section': 'Small plates',
            },
          ),
          SpaceContentEntry(
            id: 'menu-biryani',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'menu',
            title: 'House dum biryani',
            subtitle: 'Signature mains',
            sku: null,
            collectionId: 'menu',
            screen: 'ms',
            cardId: 'house-biryani',
            productIndex: null,
            rank: 2,
            metadata: const {
              'price': '₹760',
              'section': 'Signature mains',
            },
          ),
        ];
      case SpaceType.businessCard:
        return [
          SpaceContentEntry(
            id: 'contact-founder',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'contact',
            title: 'Ananya Reddy',
            subtitle: 'Founder · Digi Host',
            sku: null,
            collectionId: 'contacts',
            screen: 'cs',
            cardId: 'business-card-contact',
            productIndex: null,
            rank: 0,
            metadata: const {
              'phone': '+91 98888 88999',
              'email': 'ananya@digi.example',
            },
          ),
          SpaceContentEntry(
            id: 'offer-intro',
            spaceId: spaceId,
            source: 'seed',
            contentType: 'offer',
            title: 'Book a product walkthrough',
            subtitle: 'Host spotlight',
            sku: null,
            collectionId: 'live',
            screen: 'ls',
            cardId: 'walkthrough-offer',
            productIndex: null,
            rank: 1,
            metadata: const {
              'saveTitle': 'Product walkthrough booking',
            },
          ),
        ];
    }
  }

  List<LiveContentItem> liveContentLibraryForPrimarySpace() {
    final space = primarySpace;
    if (space == null) {
      return const [];
    }
    return _entriesForSpace(space.id)
        .map(
          (entry) => LiveContentItem(
            id: entry.id,
            title: entry.title,
            subtitle: entry.subtitle,
            collectionId: entry.collectionId,
            screen: entry.screen,
            cardId: entry.cardId,
            productIndex: entry.productIndex,
          ),
        )
        .toList();
  }

  CatalogValidationResult _validateCatalogImportCsv(String csvText, HostSetupSnapshot currentSetup) {
    final trimmed = csvText.trim();
    if (trimmed.isEmpty) {
      return const CatalogValidationResult(
        status: 'failed',
        processedRows: 0,
        acceptedRows: 0,
        rejectedRows: 0,
        rows: [],
      );
    }

    final lines = trimmed.split(RegExp(r'\r?\n')).where((line) => line.trim().isNotEmpty).toList();
    final headers = lines.first.split(',').map((header) => header.trim().toLowerCase()).toList();
    const required = ['space_name', 'brand_name', 'content_type', 'title', 'subtitle', 'sku'];
    final missing = required.where((header) => !headers.contains(header)).toList();
    if (missing.isNotEmpty) {
      return CatalogValidationResult(
        status: 'failed',
        processedRows: max(0, lines.length - 1),
        acceptedRows: 0,
        rejectedRows: max(0, lines.length - 1),
        rows: [
          CatalogImportRowResult(
            rowNumber: 1,
            status: 'rejected',
            spaceName: '',
            brandName: '',
            contentType: '',
            title: '',
            subtitle: '',
            sku: '',
            message: 'Missing headers: ${missing.join(', ')}',
          ),
        ],
      );
    }

    final rows = <CatalogImportRowResult>[];
    var accepted = 0;
    var rejected = 0;
    const allowedContentTypes = {'product', 'contact', 'menu', 'offer'};
    for (var index = 1; index < lines.length; index += 1) {
      final values = lines[index].split(',').map((value) => value.trim()).toList();
      String field(String name) {
        final position = headers.indexOf(name);
        return position >= 0 && position < values.length ? values[position] : '';
      }

      final spaceName = field('space_name');
      final brandName = field('brand_name');
      final contentType = field('content_type');
      final title = field('title');
      final subtitle = field('subtitle');
      final sku = field('sku');
      final issues = <String>[];

      if (!currentSetup.spaces.any((space) => space.name.toLowerCase() == spaceName.toLowerCase())) {
        issues.add('space_name does not match an existing space');
      }
      if (!currentSetup.brandProfiles.any((brand) => brand.name.toLowerCase() == brandName.toLowerCase())) {
        issues.add('brand_name does not match an existing brand');
      }
      if (!allowedContentTypes.contains(contentType)) {
        issues.add('content_type must be one of product, contact, menu, offer');
      }
      if (title.isEmpty) {
        issues.add('title is required');
      }

      final row = CatalogImportRowResult(
        rowNumber: index,
        status: issues.isEmpty ? 'accepted' : 'rejected',
        spaceName: spaceName,
        brandName: brandName,
        contentType: contentType,
        title: title,
        subtitle: subtitle,
        sku: sku,
        message: issues.join('; '),
      );
      rows.add(row);
      if (issues.isEmpty) {
        accepted += 1;
      } else {
        rejected += 1;
      }
    }

    final status = accepted == 0
        ? 'failed'
        : rejected == 0
            ? 'validated'
            : 'partial';
    return CatalogValidationResult(
      status: status,
      processedRows: rows.length,
      acceptedRows: accepted,
      rejectedRows: rejected,
      rows: rows,
    );
  }

  List<SpaceContentEntry> _mergeImportRowsIntoEntries(
    String spaceId,
    SpaceType spaceType,
    List<SpaceContentEntry> existingEntries,
    List<CatalogImportRowResult> rows,
  ) {
    final imported = <SpaceContentEntry>[];
    var rank = 0;
    var productIndex = 0;
    for (final row in rows.where((row) => row.status == 'accepted')) {
      final contentType = row.contentType == 'offer' ? 'offer' : row.contentType;
      final collectionId = switch (contentType) {
        'product' => 'products',
        'contact' => 'contacts',
        'menu' => 'menu',
        _ => 'live',
      };
      final screen = switch (contentType) {
        'product' => 'ps',
        'contact' => 'cs',
        'menu' => 'ms',
        _ => 'ls',
      };
      imported.add(
        SpaceContentEntry(
          id: 'import-${_slugify(row.title)}',
          spaceId: spaceId,
          source: 'import',
          contentType: contentType,
          title: row.title,
          subtitle: row.subtitle.isEmpty ? '${spaceType.label} import' : row.subtitle,
          sku: row.sku.isEmpty ? null : row.sku,
          collectionId: collectionId,
          screen: screen,
          cardId: row.sku.isEmpty ? _slugify(row.title) : row.sku,
          productIndex: contentType == 'product' ? productIndex++ : null,
          rank: rank++,
          metadata: {
            'imported': true,
            'message': row.message,
          },
        ),
      );
    }

    final preservedSeed = existingEntries.where((entry) => entry.source == 'seed').toList();
    final merged = [...imported, ...preservedSeed];
    return [
      for (var index = 0; index < merged.length; index += 1)
        SpaceContentEntry(
          id: merged[index].id,
          spaceId: merged[index].spaceId,
          source: merged[index].source,
          contentType: merged[index].contentType,
          title: merged[index].title,
          subtitle: merged[index].subtitle,
          sku: merged[index].sku,
          collectionId: merged[index].collectionId,
          screen: merged[index].screen,
          cardId: merged[index].cardId,
          productIndex: merged[index].contentType == 'product' ? merged[index].productIndex : null,
          rank: index,
          metadata: merged[index].metadata,
        ),
    ];
  }
}

class PageShell extends StatelessWidget {
  const PageShell({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.description,
    required this.children,
    this.footer,
  });

  final String eyebrow;
  final String title;
  final String description;
  final List<Widget> children;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0x141A2436),
        border: Border.all(color: const Color(0x2AFFFFFF)),
        borderRadius: BorderRadius.circular(28),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            eyebrow,
            style: const TextStyle(
              color: Color(0xFF7DD3FC),
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.4,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFFF8FAFC),
              fontSize: 34,
              fontWeight: FontWeight.w800,
              height: 1.05,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            description,
            style: const TextStyle(
              color: Color(0xFFCBD5E1),
              fontSize: 15,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 24),
          ...children,
          if (footer != null) ...[
            const SizedBox(height: 24),
            footer!,
          ],
        ],
      ),
    );
  }
}

class NoticeBanner extends StatelessWidget {
  const NoticeBanner({super.key, required this.message, required this.onDismiss});

  final String message;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return _BannerBox(
      color: const Color(0x3322C55E),
      title: 'Status',
      message: message,
      onDismiss: onDismiss,
    );
  }
}

class ErrorBanner extends StatelessWidget {
  const ErrorBanner({super.key, required this.message, required this.onDismiss});

  final String message;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return _BannerBox(
      color: const Color(0x33DC2626),
      title: 'Error',
      message: message,
      onDismiss: onDismiss,
    );
  }
}

class _BannerBox extends StatelessWidget {
  const _BannerBox({
    required this.color,
    required this.title,
    required this.message,
    required this.onDismiss,
  });

  final Color color;
  final String title;
  final String message;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(18),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFFF8FAFC))),
                const SizedBox(height: 4),
                Text(message, style: const TextStyle(color: Color(0xFFE2E8F0))),
              ],
            ),
          ),
          IconButton(
            onPressed: onDismiss,
            icon: const Icon(Icons.close, color: Color(0xFFE2E8F0)),
          ),
        ],
      ),
    );
  }
}

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  late final TextEditingController phoneController;

  @override
  void initState() {
    super.initState();
    phoneController = TextEditingController(text: '+91 ');
  }

  @override
  void dispose() {
    phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageShell(
      eyebrow: 'M8 Flutter Host',
      title: 'Create your host account',
      description:
          'The host product is now a Flutter-native app. OTP coverage stays out of this automated milestone, so the full walkthrough uses the demo workspace while the real phone path remains environment-specific.',
      children: [
        _FieldSection(
          label: 'Phone number',
          child: TextField(
            controller: phoneController,
            decoration: const InputDecoration(
              hintText: '+91 98765 43210',
              filled: true,
              fillColor: Color(0xFFF8FAFC),
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Use the demo workspace to validate setup, QR, live control, attendee sync, analytics, imports, and operations without blocking on SMS delivery.',
          style: TextStyle(color: Color(0xFFCBD5E1), height: 1.5),
        ),
      ],
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          FilledButton(
            onPressed: null,
            child: const Text('Send verification code'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: widget.controller.startDemoMode,
            child: const Text('Continue with demo workspace'),
          ),
        ],
      ),
    );
  }
}

class AccountSetupScreen extends StatefulWidget {
  const AccountSetupScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  State<AccountSetupScreen> createState() => _AccountSetupScreenState();
}

class _AccountSetupScreenState extends State<AccountSetupScreen> {
  late final TextEditingController businessNameController;
  late SpaceType selectedType;

  @override
  void initState() {
    super.initState();
    businessNameController = TextEditingController(text: widget.controller.draft.businessName);
    selectedType = widget.controller.draft.spaceType;
  }

  @override
  void dispose() {
    businessNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageShell(
      eyebrow: 'M8 Setup',
      title: 'Name the business',
      description:
          'Scope is now limited to business cards, store offers, and restaurant. Pick the primary space intent here so every later flow stays inside that product boundary.',
      children: [
        _FieldSection(
          label: 'Business name',
          child: TextField(
            controller: businessNameController,
            decoration: const InputDecoration(
              hintText: 'Vega Auto',
              filled: true,
              fillColor: Color(0xFFF8FAFC),
            ),
          ),
        ),
        const SizedBox(height: 18),
        const Text(
          'Primary space type',
          style: TextStyle(color: Color(0xFFE2E8F0), fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: SpaceType.values
              .map(
                (type) => ChoiceChip(
                  label: Text(type.label),
                  selected: selectedType == type,
                  onSelected: (_) => setState(() => selectedType = type),
                ),
              )
              .toList(),
        ),
      ],
      footer: FilledButton(
        onPressed: () {
          if (businessNameController.text.trim().isEmpty) {
            return;
          }
          widget.controller.continueAccountStep(
            businessName: businessNameController.text,
            spaceType: selectedType,
          );
        },
        child: const Text('Continue to brand setup'),
      ),
    );
  }
}

class BrandSetupScreen extends StatefulWidget {
  const BrandSetupScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  State<BrandSetupScreen> createState() => _BrandSetupScreenState();
}

class _BrandSetupScreenState extends State<BrandSetupScreen> {
  static const primaryColors = ['#184A8B', '#92400E', '#166534', '#7C3AED'];
  static const paperColors = ['#F6F0E8', '#FFF7ED', '#F0FDF4', '#F5F3FF'];
  static const fonts = ['DM Sans', 'Cormorant Garamond', 'Instrument Serif'];

  late final TextEditingController brandController;
  late String primaryColor;
  late String secondaryColor;
  late String fontFamily;

  @override
  void initState() {
    super.initState();
    brandController = TextEditingController(text: widget.controller.draft.brandName);
    primaryColor = widget.controller.draft.primaryColor;
    secondaryColor = widget.controller.draft.secondaryColor;
    fontFamily = widget.controller.draft.fontFamily;
  }

  @override
  void dispose() {
    brandController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageShell(
      eyebrow: 'M8 Setup',
      title: 'Shape the brand',
      description:
          'The first brand treatment carries into the QR, attendee route, and live surfaces. Keep it crisp enough for store offers, restaurant service, or a business-card room.',
      children: [
        _FieldSection(
          label: 'Brand label',
          child: TextField(
            controller: brandController,
            decoration: const InputDecoration(
              hintText: 'Vega Prime',
              filled: true,
              fillColor: Color(0xFFF8FAFC),
            ),
          ),
        ),
        const SizedBox(height: 18),
        const Text('Primary colour', style: TextStyle(color: Color(0xFFE2E8F0), fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: primaryColors
              .map(
                (color) => ColorChoiceChip(
                  value: color,
                  selected: primaryColor == color,
                  onTap: () => setState(() => primaryColor = color),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 18),
        const Text('Paper tone', style: TextStyle(color: Color(0xFFE2E8F0), fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: paperColors
              .map(
                (color) => ColorChoiceChip(
                  value: color,
                  selected: secondaryColor == color,
                  onTap: () => setState(() => secondaryColor = color),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 18),
        const Text('Display font intent', style: TextStyle(color: Color(0xFFE2E8F0), fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: fonts
              .map(
                (font) => ChoiceChip(
                  label: Text(font),
                  selected: fontFamily == font,
                  onSelected: (_) => setState(() => fontFamily = font),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 18),
        PreviewCard(
          businessName: widget.controller.draft.businessName,
          brandName: brandController.text,
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
        ),
      ],
      footer: FilledButton(
        onPressed: () {
          if (brandController.text.trim().isEmpty) {
            return;
          }
          widget.controller.continueBrandStep(
            brandName: brandController.text,
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            fontFamily: fontFamily,
          );
        },
        child: const Text('Continue to space settings'),
      ),
    );
  }
}

class SpaceSetupScreen extends StatefulWidget {
  const SpaceSetupScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  State<SpaceSetupScreen> createState() => _SpaceSetupScreenState();
}

class _SpaceSetupScreenState extends State<SpaceSetupScreen> {
  static const durations = [30, 45, 60, 90, 120];

  late final TextEditingController spaceNameController;
  late SpaceMode mode;
  late int duration;

  @override
  void initState() {
    super.initState();
    spaceNameController = TextEditingController(text: widget.controller.draft.spaceName);
    mode = widget.controller.draft.mode;
    duration = widget.controller.draft.defaultSessionDurationMinutes;
  }

  @override
  void dispose() {
    spaceNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageShell(
      eyebrow: 'M8 Setup',
      title: 'Configure the first space',
      description:
          'The QR slug stays attached to this space while sessions start and end. Keep one permanent room name, attendee mode, and default session window.',
      children: [
        _FieldSection(
          label: 'Space name',
          child: TextField(
            controller: spaceNameController,
            decoration: const InputDecoration(
              hintText: 'Dealer Day',
              filled: true,
              fillColor: Color(0xFFF8FAFC),
            ),
          ),
        ),
        const SizedBox(height: 18),
        const Text('Attendee mode', style: TextStyle(color: Color(0xFFE2E8F0), fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: SpaceMode.values
              .map(
                (item) => ChoiceChip(
                  label: Text(item.label),
                  selected: mode == item,
                  onSelected: (_) => setState(() => mode = item),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 18),
        const Text('Default session duration', style: TextStyle(color: Color(0xFFE2E8F0), fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: durations
              .map(
                (item) => ChoiceChip(
                  label: Text('$item min'),
                  selected: duration == item,
                  onSelected: (_) => setState(() => duration = item),
                ),
              )
              .toList(),
        ),
      ],
      footer: FilledButton(
        onPressed: () {
          if (spaceNameController.text.trim().isEmpty) {
            return;
          }
          widget.controller.saveSpaceSetup(
            spaceName: spaceNameController.text,
            mode: mode,
            durationMinutes: duration,
          );
        },
        child: const Text('Save and generate QR'),
      ),
    );
  }
}

class QrScreen extends StatelessWidget {
  const QrScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  Widget build(BuildContext context) {
    final space = controller.primarySpace;
    final attendeeUrl = space == null ? '' : controller._buildAttendeeUrl(space);

    return PageShell(
      eyebrow: 'M8 Host',
      title: 'Space QR',
      description:
          'The QR target is permanent at the space level. This is the first share surface before live control and attendee presence kick in.',
      children: [
        if (space != null)
          CardSurface(
            child: Column(
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: QrImageView(
                      data: attendeeUrl,
                      size: 220,
                      backgroundColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text(space.name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
                const SizedBox(height: 6),
                Text(space.qrSlug, style: const TextStyle(color: Color(0xFF475569), fontWeight: FontWeight.w700)),
                const SizedBox(height: 10),
                SelectableText(attendeeUrl, style: const TextStyle(color: Color(0xFF334155))),
              ],
            ),
          ),
      ],
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          FilledButton(onPressed: controller.copyAttendeeLink, child: const Text('Copy attendee link')),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: controller.openDashboard, child: const Text('Open dashboard')),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: controller.launchAttendeeSpace, child: const Text('Open attendee space')),
        ],
      ),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  Widget build(BuildContext context) {
    final setup = controller.setup;
    final account = setup?.account;
    final space = controller.primarySpace;
    final operations = controller.operations;
    final livePanel = controller.livePanel;

    return PageShell(
      eyebrow: controller.demoMode ? 'M8 Dashboard · Demo' : 'M8 Dashboard',
      title: account?.businessName ?? 'Host dashboard',
      description:
          'The Flutter host app now owns the real operator journey: one default room, a permanent QR, one go-live path, analytics, imports, and team operations within the narrowed business scope.',
      children: [
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            MetricSurface(
              label: 'Verification',
              title: account?.verificationTier == 'business_verified' ? 'Business verified' : 'Phone verified',
              copy: 'Primary phone: ${account?.primaryPhone ?? 'Pending real OTP session'}',
            ),
            if (space != null)
              MetricSurface(
                label: 'Default space',
                title: space.name,
                copy: '${space.spaceType.label} · ${space.mode.label} · ${space.defaultSessionDurationMinutes} min',
              ),
            MetricSurface(
              label: 'Operations snapshot',
              title: '${operations.analytics.sessionCount} sessions · ${operations.analytics.activeSpaces} active spaces',
              copy:
                  '${operations.analytics.totalViews} views · ${operations.analytics.totalSaves} saves · ${operations.teamMembers.length} team members',
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (livePanel != null)
          HighlightSurface(
            eyebrow: 'Live session active',
            title: _formatTimeRemaining(livePanel.endsAt),
            copy:
                '${livePanel.metrics.attendeeCount} attendees · ${livePanel.metrics.totalViews} views · ${livePanel.metrics.totalSaves} saves',
          )
        else
          MetricSurface(
            label: 'Next action',
            title: 'Start the first live room',
            copy: 'Use the go-live screen to open the attendee room and begin collecting real presence and content activity.',
          ),
      ],
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          FilledButton(onPressed: controller.openQr, child: const Text('Show QR')),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: controller.openOperations, child: const Text('Open operations')),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: livePanel != null ? controller.openLivePanel : controller.openGoLive,
            child: Text(livePanel != null ? 'Open live panel' : 'Go Live'),
          ),
          if (controller.sessionSummary != null) ...[
            const SizedBox(height: 12),
            OutlinedButton(onPressed: controller.openSessionSummary, child: const Text('View last summary')),
          ],
          const SizedBox(height: 12),
          OutlinedButton(onPressed: controller.signOut, child: const Text('Sign out')),
        ],
      ),
    );
  }
}

class GoLiveScreen extends StatefulWidget {
  const GoLiveScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  State<GoLiveScreen> createState() => _GoLiveScreenState();
}

class _GoLiveScreenState extends State<GoLiveScreen> {
  static const durations = [30, 45, 60, 90, 120];
  late int duration;

  @override
  void initState() {
    super.initState();
    duration = widget.controller.primarySpace?.defaultSessionDurationMinutes ?? 60;
  }

  @override
  Widget build(BuildContext context) {
    return PageShell(
      eyebrow: 'M8 Host',
      title: 'Go live',
      description:
          'This creates the canonical live session for the current room. The host then manages pinning, attendee sync, and the end-of-session summary from Flutter.',
      children: [
        const Text('Live duration', style: TextStyle(color: Color(0xFFE2E8F0), fontWeight: FontWeight.w700)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: durations
              .map(
                (item) => ChoiceChip(
                  label: Text('$item min'),
                  selected: duration == item,
                  onSelected: (_) => setState(() => duration = item),
                ),
              )
              .toList(),
        ),
      ],
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          FilledButton(
            onPressed: () => widget.controller.goLive(duration),
            child: const Text('Confirm and go live'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: widget.controller.openDashboard, child: const Text('Back to dashboard')),
        ],
      ),
    );
  }
}

class LivePanelScreen extends StatelessWidget {
  const LivePanelScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  Widget build(BuildContext context) {
    final livePanel = controller.livePanel;
    final space = controller.primarySpace;
    if (livePanel == null || space == null) {
      return PageShell(
        eyebrow: 'M8 Live Panel',
        title: 'No live room',
        description: 'Open a live session before the live panel becomes available.',
        children: const [
          Text(
            'This space is not live yet. Start a session from the dashboard or go-live flow first.',
            style: TextStyle(color: Color(0xFFCBD5E1), height: 1.5),
          ),
        ],
        footer: OutlinedButton(
          onPressed: controller.openDashboard,
          child: const Text('Back to dashboard'),
        ),
      );
    }

    final contentLibrary = controller.liveContentLibraryForPrimarySpace();

    return PageShell(
      eyebrow: controller.demoMode ? 'M8 Live Panel · Demo' : 'M8 Live Panel',
      title: space.name,
      description:
          'Monitor attendee presence, push one featured item, and close the room with a tracked session summary. The browser tests use this same screen against the Flutter web build.',
      children: [
        HighlightSurface(
          eyebrow: 'Live now',
          title: _formatTimeRemaining(livePanel.endsAt),
          copy:
              '${livePanel.metrics.attendeeCount} attendees · ${livePanel.metrics.totalViews} views · ${livePanel.metrics.totalSaves} saves',
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            StatCard(value: '${livePanel.metrics.attendeeCount}', label: 'Attendees'),
            StatCard(value: '${livePanel.metrics.totalViews}', label: 'Views'),
            StatCard(value: '${livePanel.metrics.totalSaves}', label: 'Saves'),
          ],
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Pinned now'),
              const SizedBox(height: 8),
              Text(
                livePanel.pinnedItem?.title ?? 'Nothing pinned yet',
                style: const TextStyle(color: Color(0xFF111827), fontSize: 22, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                livePanel.pinnedItem?.subtitle ?? 'Choose one item to spotlight for everyone in the room.',
                style: const TextStyle(color: Color(0xFF475569), height: 1.5),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Recent attendees'),
              const SizedBox(height: 10),
              if (livePanel.recentAttendees.isEmpty)
                const Text(
                  'Open the attendee space to populate presence and activity in this room.',
                  style: TextStyle(color: Color(0xFF475569)),
                )
              else
                ...livePanel.recentAttendees.map(
                  (attendee) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            attendee.attendeeName ?? 'Anonymous attendee',
                            style: const TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.w700),
                          ),
                        ),
                        Text(
                          'Last seen ${_formatClock(attendee.lastSeenAt)}',
                          style: const TextStyle(color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Pin controls'),
              const SizedBox(height: 8),
              const Text(
                'Choose one featured item',
                style: TextStyle(color: Color(0xFF111827), fontSize: 22, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 16),
              ...contentLibrary.map(
                (content) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(content.title, style: const TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            Text(content.subtitle, style: const TextStyle(color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      FilledButton(
                        onPressed: () => controller.pinLiveContent(content),
                        child: Text(livePanel.pinnedItem?.id == content.id ? 'Pinned' : 'Pin'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          FilledButton(onPressed: controller.launchAttendeeSpace, child: const Text('Open attendee space')),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: controller.refreshLivePanel, child: const Text('Refresh live panel')),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: controller.endLiveSession, child: const Text('End live session')),
        ],
      ),
    );
  }
}

class SessionSummaryScreen extends StatelessWidget {
  const SessionSummaryScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  Widget build(BuildContext context) {
    final summary = controller.sessionSummary;
    if (summary == null) {
      return PageShell(
        eyebrow: 'M8 Summary',
        title: 'No summary yet',
        description: 'A session summary appears after the host ends a live room.',
        children: const [
          Text('End a live room first to generate the session summary.', style: TextStyle(color: Color(0xFFCBD5E1))),
        ],
        footer: OutlinedButton(onPressed: controller.openDashboard, child: const Text('Back to dashboard')),
      );
    }

    return PageShell(
      eyebrow: 'M8 Summary',
      title: 'Session summary',
      description:
          'This summary reuses the same event stream as the live panel so post-session metrics remain trustworthy across host and attendee.',
      children: [
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${summary.metrics.attendeeCount} attendees',
                style: const TextStyle(color: Color(0xFF111827), fontSize: 30, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                '${summary.metrics.totalViews} views · ${summary.metrics.totalSaves} saves · save rate ${summary.metrics.saveRate}',
                style: const TextStyle(color: Color(0xFF475569)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            StatCard(value: '${summary.metrics.totalViews}', label: 'Content views'),
            StatCard(value: '${summary.metrics.totalSaves}', label: 'Saves'),
            StatCard(value: '${summary.metrics.peakAttendeeCount}', label: 'Peak live'),
          ],
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Top content'),
              const SizedBox(height: 10),
              if (summary.topContent.isEmpty)
                const Text(
                  'No standout item yet. Open the attendee room and interact with shared content to populate metrics.',
                  style: TextStyle(color: Color(0xFF475569)),
                )
              else
                ...summary.topContent.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Text(
                      '${item.title} · ${item.views} views · ${item.saves} saves',
                      style: const TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Shareable summary'),
              const SizedBox(height: 10),
              Text(summary.shareText, style: const TextStyle(color: Color(0xFF475569), height: 1.5)),
            ],
          ),
        ),
      ],
      footer: OutlinedButton(onPressed: controller.openDashboard, child: const Text('Back to dashboard')),
    );
  }
}

class OperationsScreen extends StatefulWidget {
  const OperationsScreen({super.key, required this.controller});

  final HostAppController controller;

  @override
  State<OperationsScreen> createState() => _OperationsScreenState();
}

class _OperationsScreenState extends State<OperationsScreen> {
  static const primaryColors = ['#184A8B', '#92400E', '#166534', '#7C3AED'];
  static const paperColors = ['#F6F0E8', '#FFF7ED', '#F0FDF4', '#F5F3FF'];
  static const fonts = ['DM Sans', 'Cormorant Garamond', 'Instrument Serif'];

  late final TextEditingController importFileController;
  late final TextEditingController csvController;
  late final TextEditingController inviteNameController;
  late final TextEditingController invitePhoneController;
  late final TextEditingController brandNameController;
  late final TextEditingController spaceNameController;
  late final TextEditingController spaceDurationController;
  late TeamRole inviteRole;
  late String brandPrimaryColor;
  late String brandSecondaryColor;
  late String brandFont;
  late String selectedBrandId;
  late SpaceType spaceType;
  late SpaceMode spaceMode;

  @override
  void initState() {
    super.initState();
    final controller = widget.controller;
    final primarySpace = controller.primarySpace;
    final defaultBrand = controller.setup?.brandProfiles.first;

    importFileController = TextEditingController(text: 'catalog-import.csv');
    csvController = TextEditingController(
      text: _buildCatalogImportTemplateCsv(
        primarySpace?.name ?? 'Dealer Day',
        defaultBrand?.name ?? 'Primary Brand',
      ),
    );
    inviteNameController = TextEditingController(text: 'Maya Kapoor');
    invitePhoneController = TextEditingController(text: '+91 90000 11223');
    brandNameController = TextEditingController(text: 'Campaign Brand');
    spaceNameController = TextEditingController(text: 'South Zone Meet-Up');
    spaceDurationController = TextEditingController(text: '45');
    inviteRole = TeamRole.admin;
    brandPrimaryColor = primaryColors[1];
    brandSecondaryColor = paperColors.first;
    brandFont = fonts.first;
    selectedBrandId = defaultBrand?.id ?? '';
    spaceType = SpaceType.businessCard;
    spaceMode = SpaceMode.identified;
  }

  @override
  void dispose() {
    importFileController.dispose();
    csvController.dispose();
    inviteNameController.dispose();
    invitePhoneController.dispose();
    brandNameController.dispose();
    spaceNameController.dispose();
    spaceDurationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final operations = widget.controller.operations;
    final setup = widget.controller.setup;
    final brands = setup?.brandProfiles ?? const <HostBrandProfile>[];
    final spaces = setup?.spaces ?? const <HostSpace>[];

    return PageShell(
      eyebrow: 'M8 Operations',
      title: 'Operations',
      description:
          'Run the business beyond a single room: monitor analytics, validate imports, manage team access, and create or retire business-card, store, and restaurant spaces only.',
      children: [
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Analytics'),
              const SizedBox(height: 8),
              const Text('Pilot health', style: TextStyle(color: Color(0xFF111827), fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: AnalyticsRange.values
                    .map(
                      (item) => ChoiceChip(
                        label: Text(item.label),
                        selected: widget.controller.operationsRange == item,
                        onSelected: (_) => widget.controller.refreshOperations(item),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  StatCard(value: '${operations.analytics.sessionCount}', label: 'Sessions'),
                  StatCard(value: '${operations.analytics.totalViews}', label: 'Views'),
                  StatCard(value: '${operations.analytics.totalSaves}', label: 'Saves'),
                  StatCard(value: '${operations.analytics.attendeeCount}', label: 'Attendees'),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Top spaces', style: TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              if (operations.analytics.topSpaces.isEmpty)
                const Text('No session history yet for this range.', style: TextStyle(color: Color(0xFF64748B)))
              else
                ...operations.analytics.topSpaces.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Text(
                      '${item.spaceName} · ${item.sessionCount} sessions · ${item.attendeeCount} attendees · ${item.totalSaves} saves',
                      style: const TextStyle(color: Color(0xFF111827)),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Catalog import'),
              const SizedBox(height: 8),
              const Text('Validate and record import', style: TextStyle(color: Color(0xFF111827), fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              _FieldSection(
                label: 'File name',
                child: TextField(
                  controller: importFileController,
                  decoration: const InputDecoration(filled: true, fillColor: Color(0xFFF8FAFC)),
                ),
              ),
              const SizedBox(height: 12),
              _FieldSection(
                label: 'CSV payload',
                child: TextField(
                  controller: csvController,
                  maxLines: 7,
                  decoration: const InputDecoration(filled: true, fillColor: Color(0xFFF8FAFC)),
                ),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => widget.controller.submitCatalogImport(
                  fileName: importFileController.text,
                  csvText: csvController.text,
                ),
                child: const Text('Validate and record import'),
              ),
              if (operations.importJobs.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  '${operations.importJobs.first.fileName} · ${_capitalize(operations.importJobs.first.status)}',
                  style: const TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 6),
                ...operations.importJobs.first.rows.take(4).map(
                  (row) => Text(
                    row.message.isEmpty ? row.title : row.message,
                    style: TextStyle(color: row.status == 'accepted' ? const Color(0xFF166534) : const Color(0xFFB91C1C)),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Team access'),
              const SizedBox(height: 8),
              const Text('Invite operators', style: TextStyle(color: Color(0xFF111827), fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              _FieldSection(
                label: 'Invite name',
                child: TextField(
                  controller: inviteNameController,
                  decoration: const InputDecoration(filled: true, fillColor: Color(0xFFF8FAFC)),
                ),
              ),
              const SizedBox(height: 12),
              _FieldSection(
                label: 'Invite phone',
                child: TextField(
                  controller: invitePhoneController,
                  decoration: const InputDecoration(filled: true, fillColor: Color(0xFFF8FAFC)),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: TeamRole.values
                    .where((item) => item != TeamRole.owner)
                    .map(
                      (item) => ChoiceChip(
                        label: Text(item.label),
                        selected: inviteRole == item,
                        onSelected: (_) => setState(() => inviteRole = item),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => widget.controller.inviteTeamAccess(
                  displayName: inviteNameController.text,
                  phone: invitePhoneController.text,
                  role: inviteRole,
                ),
                child: const Text('Send invite'),
              ),
              const SizedBox(height: 12),
              ...operations.teamInvites.map(
                (invite) => Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${invite.displayName} · ${invite.role.label} · ${_capitalize(invite.status)}',
                        style: const TextStyle(color: Color(0xFF111827)),
                      ),
                    ),
                    if (invite.status == 'pending')
                      TextButton(
                        onPressed: () => widget.controller.revokeInvite(invite.id),
                        child: const Text('Revoke'),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Brands'),
              const SizedBox(height: 8),
              const Text('Create brand profile', style: TextStyle(color: Color(0xFF111827), fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              _FieldSection(
                label: 'Brand name',
                child: TextField(
                  controller: brandNameController,
                  decoration: const InputDecoration(filled: true, fillColor: Color(0xFFF8FAFC)),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: primaryColors
                    .map(
                      (color) => ColorChoiceChip(
                        value: color,
                        selected: brandPrimaryColor == color,
                        onTap: () => setState(() => brandPrimaryColor = color),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: paperColors
                    .map(
                      (color) => ColorChoiceChip(
                        value: color,
                        selected: brandSecondaryColor == color,
                        onTap: () => setState(() => brandSecondaryColor = color),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: fonts
                    .map(
                      (font) => ChoiceChip(
                        label: Text(font),
                        selected: brandFont == font,
                        onSelected: (_) => setState(() => brandFont = font),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => widget.controller.createBrand(
                  name: brandNameController.text,
                  primaryColor: brandPrimaryColor,
                  secondaryColor: brandSecondaryColor,
                  fontFamily: brandFont,
                ),
                child: const Text('Create brand profile'),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: brands
                    .map(
                      (brand) => ChoiceChip(
                        label: Text(brand.name),
                        selected: selectedBrandId == brand.id,
                        onSelected: (_) => setState(() => selectedBrandId = brand.id),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        CardSurface(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionEyebrow('Spaces'),
              const SizedBox(height: 8),
              const Text('Create space', style: TextStyle(color: Color(0xFF111827), fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              _FieldSection(
                label: 'Space name',
                child: TextField(
                  controller: spaceNameController,
                  decoration: const InputDecoration(filled: true, fillColor: Color(0xFFF8FAFC)),
                ),
              ),
              const SizedBox(height: 12),
              _FieldSection(
                label: 'Default session minutes',
                child: TextField(
                  controller: spaceDurationController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(filled: true, fillColor: Color(0xFFF8FAFC)),
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: SpaceType.values
                    .map(
                      (item) => ChoiceChip(
                        label: Text(item.label),
                        selected: spaceType == item,
                        onSelected: (_) => setState(() => spaceType = item),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: SpaceMode.values
                    .map(
                      (item) => ChoiceChip(
                        label: Text(item.label),
                        selected: spaceMode == item,
                        onSelected: (_) => setState(() => spaceMode = item),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: selectedBrandId.isEmpty
                    ? null
                    : () => widget.controller.createSpace(
                          name: spaceNameController.text,
                          brandProfileId: selectedBrandId,
                          spaceType: spaceType,
                          mode: spaceMode,
                          durationMinutes: int.tryParse(spaceDurationController.text) ?? 60,
                        ),
                child: const Text('Create space'),
              ),
              const SizedBox(height: 12),
              ...spaces.map(
                (space) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          '${space.name} · ${space.spaceType.label}${space.archivedAt != null ? ' · Archived' : ''}',
                          style: const TextStyle(color: Color(0xFF111827)),
                        ),
                      ),
                      if (!space.isDefault && space.archivedAt == null)
                        TextButton(
                          onPressed: () => widget.controller.archiveSpace(space.id),
                          child: const Text('Archive'),
                        ),
                      if (!space.isDefault)
                        TextButton(
                          onPressed: () => widget.controller.deleteSpace(space.id),
                          child: const Text('Delete'),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
      footer: OutlinedButton(onPressed: widget.controller.openDashboard, child: const Text('Back to dashboard')),
    );
  }
}

class _FieldSection extends StatelessWidget {
  const _FieldSection({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFFE2E8F0), fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}

class CardSurface extends StatelessWidget {
  const CardSurface({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(24),
      ),
      padding: const EdgeInsets.all(20),
      child: child,
    );
  }
}

class HighlightSurface extends StatelessWidget {
  const HighlightSurface({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.copy,
  });

  final String eyebrow;
  final String title;
  final String copy;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0x3322C55E),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0x664ADE80)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(eyebrow, style: const TextStyle(color: Color(0xFFBBF7D0), fontWeight: FontWeight.w800, fontSize: 12)),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(color: Color(0xFFF0FDF4), fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text(copy, style: const TextStyle(color: Color(0xFFDCFCE7), height: 1.5)),
        ],
      ),
    );
  }
}

class MetricSurface extends StatelessWidget {
  const MetricSurface({
    super.key,
    required this.label,
    required this.title,
    required this.copy,
  });

  final String label;
  final String title;
  final String copy;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 320,
      child: CardSurface(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionEyebrow(label),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(color: Color(0xFF111827), fontSize: 22, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(copy, style: const TextStyle(color: Color(0xFF475569), height: 1.5)),
          ],
        ),
      ),
    );
  }
}

class StatCard extends StatelessWidget {
  const StatCard({super.key, required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: CardSurface(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: const TextStyle(color: Color(0xFF111827), fontSize: 28, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class SectionEyebrow extends StatelessWidget {
  const SectionEyebrow(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        color: Color(0xFF64748B),
        fontSize: 11,
        fontWeight: FontWeight.w800,
        letterSpacing: 1.2,
      ),
    );
  }
}

class PreviewCard extends StatelessWidget {
  const PreviewCard({
    super.key,
    required this.businessName,
    required this.brandName,
    required this.primaryColor,
    required this.secondaryColor,
  });

  final String businessName;
  final String brandName;
  final String primaryColor;
  final String secondaryColor;

  @override
  Widget build(BuildContext context) {
    final primary = _parseHex(primaryColor);
    final secondary = _parseHex(secondaryColor);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: secondary,
        borderRadius: BorderRadius.circular(22),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(brandName, style: TextStyle(color: primary, fontSize: 26, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(
            businessName.isEmpty ? 'Business name' : businessName,
            style: TextStyle(color: primary.withValues(alpha: 0.78), fontSize: 14),
          ),
          const SizedBox(height: 24),
          Container(
            decoration: BoxDecoration(
              color: primary,
              borderRadius: BorderRadius.circular(16),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Text('Live attendee card preview', style: TextStyle(color: secondary, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class ColorChoiceChip extends StatelessWidget {
  const ColorChoiceChip({
    super.key,
    required this.value,
    required this.selected,
    required this.onTap,
  });

  final String value;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: _parseHex(value),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected ? const Color(0xFFF8FAFC) : Colors.transparent,
            width: 2,
          ),
        ),
        child: Text(
          value,
          style: TextStyle(
            color: _foregroundForColor(_parseHex(value)),
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

Color _parseHex(String value) {
  final normalized = value.replaceAll('#', '');
  return Color(int.parse('FF$normalized', radix: 16));
}

Color _foregroundForColor(Color color) {
  return color.computeLuminance() > 0.5 ? const Color(0xFF111827) : Colors.white;
}

String _formatTimeRemaining(DateTime? endsAt) {
  if (endsAt == null) {
    return 'Live now';
  }
  final delta = endsAt.difference(DateTime.now());
  if (delta.isNegative) {
    return 'Ending now';
  }
  final totalMinutes = max(1, delta.inMinutes);
  final hours = totalMinutes ~/ 60;
  final minutes = totalMinutes % 60;
  if (hours > 0) {
    return '${hours}h ${minutes}m remaining';
  }
  return '${minutes}m remaining';
}

String _formatClock(DateTime value) {
  final hour = value.hour == 0 ? 12 : (value.hour > 12 ? value.hour - 12 : value.hour);
  final minute = value.minute.toString().padLeft(2, '0');
  final suffix = value.hour >= 12 ? 'PM' : 'AM';
  return '$hour:$minute $suffix';
}

String _capitalize(String value) {
  if (value.isEmpty) {
    return value;
  }
  return value[0].toUpperCase() + value.substring(1);
}

String _buildCatalogImportTemplateCsv(String spaceName, String brandName) {
  return [
    'space_name,brand_name,content_type,title,subtitle,sku',
    '$spaceName,$brandName,product,65W GaN charger dealer pricing,Dealer launch offer,VE-CH03',
    '$spaceName,$brandName,contact,Rhea Sen,Regional sales lead,',
  ].join('\n');
}
