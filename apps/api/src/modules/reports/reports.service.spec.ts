import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PackageStatus } from '../../../generated/client';

describe('ReportsService - buildMerchantWorkbook', () => {
  let service: ReportsService;
  let prismaService: PrismaService;

  // Helper to get current date in Phnom Penh timezone as YYYY-MM-DD
  const getTodayPhnomPenh = (): string => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Phnom_Penh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  };

  // Helper to get date N days ago in Phnom Penh timezone
  const getDateDaysAgo = (days: number): string => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Phnom_Penh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatter.format(date);
  };

  // Helper to create a date at start of day in Phnom Penh
  const createDateAtStart = (dateStr: string): Date => {
    return new Date(`${dateStr}T00:00:00+07:00`);
  };

  // Helper to create a date at end of day in Phnom Penh
  const createDateAtEnd = (dateStr: string): Date => {
    return new Date(`${dateStr}T23:59:59.999+07:00`);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: {
            merchant: {
              findUnique: jest.fn(),
            },
            package: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Scenario 1: No date selected', () => {
    /**
     * Test Scenario 1: No date selected
     * 
     * Expected behavior:
     * - Sheet 1 (Pick up): Should show only today's packages (endDate = current date)
     * - Sheet 2 (Delivery Report): Should show all historical packages from all past dates to today
     * 
     * Date ranges:
     * - Sheet 1 query: today 00:00:00 to today 23:59:59.999 (Phnom Penh timezone)
     * - Sheet 2 query: 1900-01-01 00:00:00Z to today 23:59:59.999 (Phnom Penh timezone)
     */
    it('Sheet 1 should show only today\'s packages, Sheet 2 should show all past data to today', async () => {
      const merchantId = 'test-merchant-id';
      const todayStr = getTodayPhnomPenh();
      const yesterdayStr = getDateDaysAgo(1);
      const fiveDaysAgoStr = getDateDaysAgo(5);

      const mockMerchant = {
        id: merchantId,
        name: 'Test Merchant',
        bank: 'ABA',
        bankAccountName: 'Test Account',
      };

      // Mock merchant lookup
      (prismaService.merchant.findUnique as jest.Mock).mockResolvedValue(mockMerchant);

      // Mock today's packages (for Sheet 1)
      const todayPackages = [
        {
          id: 'pkg-1',
          packageNumber: 'PKG001',
          createdAt: createDateAtStart(todayStr),
          updatedAt: createDateAtStart(todayStr),
          status: PackageStatus.DELIVERED,
          customerName: 'Customer 1',
          customerAddress: 'Address 1',
          customerPhone: '012345678',
          codAmount: 100,
          deliveryFee: 5,
          driver: { name: 'Driver 1' },
        },
        {
          id: 'pkg-2',
          packageNumber: 'PKG002',
          createdAt: createDateAtStart(todayStr),
          updatedAt: createDateAtStart(todayStr),
          status: PackageStatus.PENDING,
          customerName: 'Customer 2',
          customerAddress: 'Address 2',
          customerPhone: '012345679',
          codAmount: 200,
          deliveryFee: 5,
          driver: { name: 'Driver 2' },
        },
      ];

      // Mock all past packages including today (for Sheet 2)
      const allPackages = [
        ...todayPackages,
        {
          id: 'pkg-3',
          packageNumber: 'PKG003',
          createdAt: createDateAtStart(yesterdayStr),
          updatedAt: createDateAtStart(yesterdayStr),
          status: PackageStatus.DELIVERED,
          customerName: 'Customer 3',
          customerAddress: 'Address 3',
          customerPhone: '012345680',
          codAmount: 150,
          deliveryFee: 5,
          driver: { name: 'Driver 1' },
        },
        {
          id: 'pkg-4',
          packageNumber: 'PKG004',
          createdAt: createDateAtStart(fiveDaysAgoStr),
          updatedAt: createDateAtStart(fiveDaysAgoStr),
          status: PackageStatus.DELIVERED,
          customerName: 'Customer 4',
          customerAddress: 'Address 4',
          customerPhone: '012345681',
          codAmount: 300,
          deliveryFee: 5,
          driver: { name: 'Driver 2' },
        },
      ];

      // Mock package queries
      (prismaService.package.findMany as jest.Mock).mockImplementation((args: any) => {
        const { where } = args;
        const { createdAt } = where;

        // Sheet 1 query: endDate only (today)
        // Today = 2025-10-31T00:00:00+07:00 to 2025-10-31T23:59:59.999+07:00
        const todayStart = createDateAtStart(todayStr);
        const todayEnd = createDateAtEnd(todayStr);
        if (
          createdAt &&
          createdAt.gte &&
          createdAt.lte &&
          Math.abs(createdAt.gte.getTime() - todayStart.getTime()) < 1000 && // Allow small time diff
          Math.abs(createdAt.lte.getTime() - todayEnd.getTime()) < 1000
        ) {
          return Promise.resolve(todayPackages);
        }

        // Sheet 2 query: all past data to today (no startDate)
        // Uses 1900-01-01T00:00:00Z as rangeStart when no startDate provided
        const earlyDate = new Date('1900-01-01T00:00:00Z');
        if (
          createdAt &&
          createdAt.gte &&
          createdAt.lte &&
          Math.abs(createdAt.gte.getTime() - earlyDate.getTime()) < 1000 && // Allow small time diff
          Math.abs(createdAt.lte.getTime() - todayEnd.getTime()) < 1000
        ) {
          return Promise.resolve(allPackages);
        }

        return Promise.resolve([]);
      });

      // Test: No date selected (undefined for both startDate and endDate)
      const result = await service.buildMerchantWorkbook(merchantId, undefined, undefined);

      // Assertions
      expect(result).toBeDefined();
      expect(result.merchant).toEqual(mockMerchant);
      expect(result.label).toBe(todayStr); // Should use today as label

      // Sheet 1 (inputPackages): Should only have today's packages
      expect(result.inputPackages.length).toBe(2);
      expect(result.inputPackages.every((pkg: any) => 
        pkg.createdAt >= createDateAtStart(todayStr) && 
        pkg.createdAt <= createDateAtEnd(todayStr)
      )).toBe(true);

      // Sheet 2 (historicalPackages): Should have all packages from past to today
      expect(result.historicalPackages.length).toBe(4);
      expect(result.historicalPackages.every((pkg: any) => 
        pkg.createdAt <= createDateAtEnd(todayStr)
      )).toBe(true);
      expect(result.historicalPackages.some((pkg: any) => 
        pkg.createdAt >= createDateAtStart(yesterdayStr)
      )).toBe(true);

      // Verify package queries were called correctly
      expect(prismaService.package.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('Scenario 2: Date range selected', () => {
    /**
     * Test Scenario 2: Date range selected (startDate and endDate provided)
     * 
     * Expected behavior:
     * - Sheet 1 (Pick up): Should show only packages from the selected endDate
     * - Sheet 2 (Delivery Report): Should show all packages from startDate to endDate (inclusive)
     * 
     * Date ranges:
     * - Sheet 1 query: endDate 00:00:00 to endDate 23:59:59.999 (Phnom Penh timezone)
     * - Sheet 2 query: startDate 00:00:00 to endDate 23:59:59.999 (Phnom Penh timezone)
     */
    it('Sheet 1 should show only endDate packages, Sheet 2 should show packages from startDate to endDate', async () => {
      const merchantId = 'test-merchant-id';
      const startDateStr = getDateDaysAgo(7); // 7 days ago
      const endDateStr = getDateDaysAgo(2); // 2 days ago

      const mockMerchant = {
        id: merchantId,
        name: 'Test Merchant',
        bank: 'ABA',
        bankAccountName: 'Test Account',
      };

      // Mock merchant lookup
      (prismaService.merchant.findUnique as jest.Mock).mockResolvedValue(mockMerchant);

      // Mock endDate packages (for Sheet 1 - 2 days ago only)
      const endDatePackages = [
        {
          id: 'pkg-end-1',
          packageNumber: 'PKGEND001',
          createdAt: createDateAtStart(endDateStr),
          updatedAt: createDateAtStart(endDateStr),
          status: PackageStatus.DELIVERED,
          customerName: 'End Date Customer 1',
          customerAddress: 'End Address 1',
          customerPhone: '012345682',
          codAmount: 100,
          deliveryFee: 5,
          driver: { name: 'Driver 1' },
        },
      ];

      // Mock packages from startDate to endDate (for Sheet 2 - 7 days ago to 2 days ago)
      const rangePackages = [
        {
          id: 'pkg-range-1',
          packageNumber: 'PKGRANGE001',
          createdAt: createDateAtStart(getDateDaysAgo(7)),
          updatedAt: createDateAtStart(getDateDaysAgo(7)),
          status: PackageStatus.DELIVERED,
          customerName: 'Range Customer 1',
          customerAddress: 'Range Address 1',
          customerPhone: '012345683',
          codAmount: 150,
          deliveryFee: 5,
          driver: { name: 'Driver 1' },
        },
        {
          id: 'pkg-range-2',
          packageNumber: 'PKGRANGE002',
          createdAt: createDateAtStart(getDateDaysAgo(5)),
          updatedAt: createDateAtStart(getDateDaysAgo(5)),
          status: PackageStatus.PENDING,
          customerName: 'Range Customer 2',
          customerAddress: 'Range Address 2',
          customerPhone: '012345684',
          codAmount: 200,
          deliveryFee: 5,
          driver: { name: 'Driver 2' },
        },
        ...endDatePackages,
      ];

      // Mock package queries
      (prismaService.package.findMany as jest.Mock).mockImplementation((args: any) => {
        const { where } = args;
        const { createdAt } = where;

        // Sheet 1 query: endDate only (2 days ago)
        // endDate 2 days ago = 2025-10-29T00:00:00+07:00 to 2025-10-29T23:59:59.999+07:00
        const endDateStart = createDateAtStart(endDateStr);
        const endDateEnd = createDateAtEnd(endDateStr);
        if (
          createdAt &&
          createdAt.gte &&
          createdAt.lte &&
          Math.abs(createdAt.gte.getTime() - endDateStart.getTime()) < 1000 && // Allow small time diff
          Math.abs(createdAt.lte.getTime() - endDateEnd.getTime()) < 1000
        ) {
          return Promise.resolve(endDatePackages);
        }

        // Sheet 2 query: startDate to endDate (7 days ago to 2 days ago)
        // startDate 7 days ago = 2025-10-24T00:00:00+07:00 (converts to UTC)
        // endDate 2 days ago = 2025-10-29T23:59:59.999+07:00 (converts to UTC)
        const startDateStart = createDateAtStart(startDateStr);
        const startDateEnd = createDateAtEnd(endDateStr);
        if (
          createdAt &&
          createdAt.gte &&
          createdAt.lte &&
          Math.abs(createdAt.gte.getTime() - startDateStart.getTime()) < 1000 && // Allow small time diff
          Math.abs(createdAt.lte.getTime() - startDateEnd.getTime()) < 1000
        ) {
          return Promise.resolve(rangePackages);
        }

        return Promise.resolve([]);
      });

      // Test: Date range selected (startDate and endDate provided)
      const result = await service.buildMerchantWorkbook(merchantId, startDateStr, endDateStr);

      // Assertions
      expect(result).toBeDefined();
      expect(result.merchant).toEqual(mockMerchant);
      expect(result.label).toBe(endDateStr); // Should use endDate as label

      // Sheet 1 (inputPackages): Should only have endDate's packages (2 days ago)
      expect(result.inputPackages.length).toBe(1);
      expect(result.inputPackages[0].id).toBe('pkg-end-1');
      expect(result.inputPackages.every((pkg: any) => 
        pkg.createdAt >= createDateAtStart(endDateStr) && 
        pkg.createdAt <= createDateAtEnd(endDateStr)
      )).toBe(true);

      // Sheet 2 (historicalPackages): Should have packages from startDate to endDate (7 days ago to 2 days ago)
      expect(result.historicalPackages.length).toBe(3);
      expect(result.historicalPackages.every((pkg: any) => 
        pkg.createdAt >= createDateAtStart(startDateStr) && 
        pkg.createdAt <= createDateAtEnd(endDateStr)
      )).toBe(true);
      expect(result.historicalPackages.some((pkg: any) => 
        pkg.id === 'pkg-range-1' // Should include packages from start date
      )).toBe(true);
      expect(result.historicalPackages.some((pkg: any) => 
        pkg.id === 'pkg-end-1' // Should include packages from end date
      )).toBe(true);

      // Verify package queries were called correctly
      expect(prismaService.package.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
    /**
     * Test edge case: Merchant not found
     * Should throw an error when the merchant ID does not exist
     */
    it('should handle merchant not found', async () => {
      const merchantId = 'non-existent-merchant';
      
      (prismaService.merchant.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.buildMerchantWorkbook(merchantId, undefined, undefined)
      ).rejects.toThrow('Merchant not found');
    });

    /**
     * Test edge case: Empty result sets
     * Should handle cases where no packages exist for the merchant
     */
    it('should handle empty result sets', async () => {
      const merchantId = 'test-merchant-id';
      const todayStr = getTodayPhnomPenh();

      const mockMerchant = {
        id: merchantId,
        name: 'Test Merchant',
        bank: 'ABA',
        bankAccountName: 'Test Account',
      };

      (prismaService.merchant.findUnique as jest.Mock).mockResolvedValue(mockMerchant);
      (prismaService.package.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.buildMerchantWorkbook(merchantId, undefined, undefined);

      expect(result).toBeDefined();
      expect(result.inputPackages.length).toBe(0);
      expect(result.historicalPackages.length).toBe(0);
    });
  });
});
