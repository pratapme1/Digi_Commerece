import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:host_flutter/main.dart';

Future<void> tapVisible(WidgetTester tester, Finder finder) async {
  await tester.ensureVisible(finder);
  await tester.tap(finder);
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('completes the demo setup, goes live, and records a session summary', (tester) async {
    await tester.pumpWidget(const DigiHostApp());
    await tester.pumpAndSettle();

    await tapVisible(tester, find.text('Continue with demo workspace'));

    await tester.enterText(find.byType(TextField).first, 'Vega Auto');
    await tapVisible(tester, find.text('Store'));
    await tapVisible(tester, find.text('Continue to brand setup'));

    await tester.enterText(find.byType(TextField).first, 'Vega Prime');
    await tapVisible(tester, find.text('Continue to space settings'));

    await tester.enterText(find.byType(TextField).first, 'Dealer Day');
    await tapVisible(tester, find.text('Save and generate QR'));

    expect(find.text('Space QR'), findsOneWidget);
    expect(find.text('dealer-day-demo'), findsOneWidget);

    await tapVisible(tester, find.text('Open dashboard'));
    expect(find.text('Vega Auto'), findsOneWidget);

    await tapVisible(tester, find.text('Go Live'));
    await tapVisible(tester, find.text('90 min'));
    await tapVisible(tester, find.text('Confirm and go live'));

    expect(find.text('Pinned now'), findsOneWidget);
    await tapVisible(tester, find.text('Pin').first);
    expect(find.text('Pinned'), findsWidgets);

    await tapVisible(tester, find.text('End live session'));
    expect(find.text('Session summary'), findsOneWidget);
    expect(find.text('0 attendees'), findsOneWidget);
  });

  testWidgets('manages operations for imports, team invites, brands, and spaces', (tester) async {
    await tester.pumpWidget(const DigiHostApp());
    await tester.pumpAndSettle();

    await tapVisible(tester, find.text('Continue with demo workspace'));
    await tester.enterText(find.byType(TextField).first, 'Atlas Retail');
    await tapVisible(tester, find.text('Store'));
    await tapVisible(tester, find.text('Continue to brand setup'));
    await tester.enterText(find.byType(TextField).first, 'Vega Prime');
    await tapVisible(tester, find.text('Continue to space settings'));
    await tester.enterText(find.byType(TextField).first, 'Dealer Day');
    await tapVisible(tester, find.text('Save and generate QR'));
    await tapVisible(tester, find.text('Open dashboard'));
    await tapVisible(tester, find.text('Open operations'));

    await tester.enterText(find.byType(TextField).at(0), 'pilot-import.csv');
    await tester.enterText(
      find.byType(TextField).at(1),
      [
        'space_name,brand_name,content_type,title,subtitle,sku',
        'Dealer Day,Vega Prime,product,Importer Spotlight Bundle,Pilot offer pricing,AT-BUNDLE-01',
        'Dealer Day,Vega Prime,contact,Rhea Sen,Regional sales lead,',
      ].join('\n'),
    );
    await tapVisible(tester, find.text('Validate and record import').last);
    expect(find.text('pilot-import.csv · Validated'), findsOneWidget);

    await tester.enterText(find.byType(TextField).at(2), 'Rhea Sen');
    await tester.enterText(find.byType(TextField).at(3), '+91 91111 11111');
    await tapVisible(tester, find.text('Admin'));
    await tapVisible(tester, find.text('Send invite'));
    expect(find.textContaining('Rhea Sen'), findsWidgets);

    await tester.enterText(find.byType(TextField).at(4), 'Sunrise Brand');
    await tapVisible(tester, find.text('Create brand profile').last);
    expect(find.text('Sunrise Brand'), findsWidgets);

    await tester.enterText(find.byType(TextField).at(5), 'South Zone Meet-Up');
    await tapVisible(tester, find.text('Business Card'));
    await tester.enterText(find.byType(TextField).at(6), '45');
    await tapVisible(tester, find.text('Create space').last);
    expect(find.text('South Zone Meet-Up · Business Card'), findsOneWidget);

    await tapVisible(tester, find.text('Archive').first);
    expect(find.textContaining('Archived'), findsOneWidget);

    await tapVisible(tester, find.text('Delete').first);
    expect(find.text('South Zone Meet-Up · Business Card'), findsNothing);
  });
}
