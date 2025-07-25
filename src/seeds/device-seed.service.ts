// src/seeds/device-seed.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Device } from '../devices/entities/device.entity';

@Injectable()
export class DeviceSeedService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private dataSource: DataSource,
  ) {}

  async seedDevices(): Promise<void> {
    try {
      // 1. 먼저 테이블 존재 여부 확인 및 생성
      await this.ensureTablesExist();

      // 2. 기존 데이터 확인
      const existingDevices = await this.deviceRepository
        .count()
        .catch(() => 0);

      if (existingDevices > 0) {
        console.log(
          '디바이스 데이터가 이미 존재합니다. 시드 작업을 건너뜁니다.',
        );
        return;
      }

      console.log('초기 디바이스 데이터를 생성합니다...');

      const deviceData = [
        // Android 디바이스들
        {
          deviceNumber: '8',
          productName: 'Galaxy Note 9',
          modelName: 'SM-N960N',
          osVersion: '10.0',
          isRootedOrJailbroken: false,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '11',
          productName: 'Galaxy Tab S6 Lite',
          modelName: 'SM-P615N',
          osVersion: '12.0',
          isRootedOrJailbroken: false,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '14',
          productName: 'Xperia Ace 2',
          modelName: 'SO-41B',
          osVersion: '13.0',
          isRootedOrJailbroken: false,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '21',
          productName: 'Galaxy S24',
          modelName: 'SM-S921N',
          osVersion: '15.0',
          isRootedOrJailbroken: false,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '24',
          productName: 'Galaxy S23',
          modelName: 'SM-S911N',
          osVersion: '14.0',
          isRootedOrJailbroken: true,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '26',
          productName: 'Pixel 8',
          modelName: 'G9BQD',
          osVersion: '16.0',
          isRootedOrJailbroken: true,
          platform: 'Android' as const,
        },
        // iOS 디바이스들
        {
          deviceNumber: 'I-2',
          productName: 'iPhone XR',
          modelName: 'A2105',
          osVersion: '14.6.0',
          isRootedOrJailbroken: true,
          platform: 'iOS' as const,
        },
        {
          deviceNumber: 'I-3',
          productName: 'iPhone 7',
          modelName: 'A1778',
          osVersion: '14.7.1',
          isRootedOrJailbroken: true,
          platform: 'iOS' as const,
        },
        {
          deviceNumber: 'I-5',
          productName: 'iPhone 12 mini',
          modelName: 'A2399',
          osVersion: '15.1.0',
          isRootedOrJailbroken: true,
          platform: 'iOS' as const,
        },
        {
          deviceNumber: 'I-14',
          productName: 'iPhone 14 Plus',
          modelName: 'A2886',
          osVersion: '18.5.0',
          isRootedOrJailbroken: false,
          platform: 'iOS' as const,
        },
      ];

      const devices = this.deviceRepository.create(deviceData);
      await this.deviceRepository.save(devices);

      console.log(
        `${devices.length}개의 디바이스 데이터가 성공적으로 저장되었습니다.`,
      );
    } catch (error) {
      console.error('시드 데이터 생성 중 오류 발생:', error);
      // 오류가 발생해도 애플리케이션 시작을 막지 않음
    }
  }

  private async ensureTablesExist(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      console.log('테이블 존재 여부를 확인합니다...');

      // devices 테이블 존재 확인 및 생성
      const devicesTableExists = await queryRunner.hasTable('devices');
      if (!devicesTableExists) {
        console.log('devices 테이블을 생성합니다...');
        await queryRunner.query(`
          CREATE TABLE "devices" (
            "id" SERIAL NOT NULL,
            "deviceNumber" character varying NOT NULL,
            "productName" character varying NOT NULL,
            "modelName" character varying,
            "osVersion" character varying NOT NULL,
            "isRootedOrJailbroken" boolean NOT NULL DEFAULT false,
            "platform" character varying NOT NULL DEFAULT 'Android',
            "status" character varying NOT NULL DEFAULT 'available',
            "currentRenter" character varying,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_devices" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_devices_deviceNumber" UNIQUE ("deviceNumber")
          )
        `);
        console.log('devices 테이블이 생성되었습니다.');
      }

      // rentals 테이블 존재 확인 및 생성
      const rentalsTableExists = await queryRunner.hasTable('rentals');
      if (!rentalsTableExists) {
        console.log('rentals 테이블을 생성합니다...');
        await queryRunner.query(`
          CREATE TABLE "rentals" (
            "id" SERIAL NOT NULL,
            "renterName" character varying NOT NULL,
            "rentedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "returnedAt" TIMESTAMP,
            "status" character varying NOT NULL DEFAULT 'active',
            "deviceId" integer NOT NULL,
            CONSTRAINT "PK_rentals" PRIMARY KEY ("id"),
            CONSTRAINT "FK_rentals_device" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
          )
        `);
        console.log('rentals 테이블이 생성되었습니다.');
      }

      console.log('모든 테이블이 준비되었습니다.');
    } catch (error) {
      console.error('테이블 생성 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
