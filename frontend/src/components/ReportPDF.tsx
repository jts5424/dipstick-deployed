import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Vehicle } from '@/lib/mockData';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0F172A',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 5,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    fontSize: 10,
    color: '#64748B',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#0F172A',
    fontWeight: 700,
  },
  scoreCard: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0F172A',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row"
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F1F5F9',
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    margin: "auto",
    fontSize: 8,
    fontWeight: 700,
    color: '#475569'
  },
  tableCell: {
    margin: "auto",
    fontSize: 8,
    color: '#334155'
  }
});

interface ReportPDFProps {
  vehicle: Vehicle;
}

const ReportPDF = ({ vehicle }: ReportPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.logo}>DIPSTICK REPORT</Text>
        <Text style={{ fontSize: 10, color: '#64748B' }}>Generated on {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>{vehicle.year} {vehicle.make} {vehicle.model}</Text>
        <Text style={styles.subtitle}>{vehicle.trim} • {vehicle.mileage.toLocaleString()} miles • VIN: {vehicle.vin}</Text>
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={[styles.scoreCard, { flex: 1 }]}>
            <View>
              <Text style={styles.scoreLabel}>Dipstick Score</Text>
              <Text style={styles.scoreValue}>{vehicle.scores.dipstickScore}/100</Text>
            </View>
          </View>
          <View style={[styles.scoreCard, { flex: 1 }]}>
            <View>
              <Text style={styles.scoreLabel}>Risk Level</Text>
              <Text style={[styles.scoreValue, { 
                color: vehicle.scores.riskLevel === 'Low' ? '#10B981' : 
                       vehicle.scores.riskLevel === 'Moderate' ? '#F59E0B' : '#EF4444' 
              }]}>{vehicle.scores.riskLevel}</Text>
            </View>
          </View>
          <View style={[styles.scoreCard, { flex: 1 }]}>
            <View>
              <Text style={styles.scoreLabel}>3-Year TCO</Text>
              <Text style={styles.scoreValue}>${vehicle.tco.totalCost.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={{ fontSize: 10, lineHeight: 1.5, color: '#334155' }}>
          {vehicle.expertAnalysis.overallEvaluation}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Risks & Issues</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '40%' }]}>
              <Text style={styles.tableCellHeader}>Risk Item</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Level</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '40%' }]}>
              <Text style={styles.tableCellHeader}>Recommendation</Text>
            </View>
          </View>
          {vehicle.risks.slice(0, 5).map((risk) => (
            <View style={styles.tableRow} key={risk.id}>
              <View style={[styles.tableCol, { width: '40%' }]}>
                <Text style={styles.tableCell}>{risk.name}</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={[styles.tableCell, { 
                  color: risk.riskLevel === 'High' ? '#EF4444' : '#F59E0B' 
                }]}>{risk.riskLevel}</Text>
              </View>
              <View style={[styles.tableCol, { width: '40%' }]}>
                <Text style={styles.tableCell}>{risk.recommendation || '-'}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Analysis</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Asking Price:</Text>
          <Text style={styles.value}>${vehicle.tco.askingPrice.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Est. Market Value:</Text>
          <Text style={styles.value}>${vehicle.valuation.retail.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Depreciation (3yr):</Text>
          <Text style={styles.value}>${vehicle.tco.depreciationLoss.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Est. Maintenance (3yr):</Text>
          <Text style={styles.value}>${(vehicle.tco.routineMaintenanceCost + vehicle.tco.expectedUnscheduledRepairCost).toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        This report is for informational purposes only. Dipstick is not responsible for purchasing decisions.
      </Text>
    </Page>
  </Document>
);

export default ReportPDF;