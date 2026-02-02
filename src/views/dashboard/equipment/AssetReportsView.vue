<template>
  <div class="asset-reports">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="page-title">
            <i class="fas fa-chart-line me-2"></i>
            รายงานครุภัณฑ์
          </h1>
          <p class="text-muted mb-0">รายงานและสถิติสำหรับโมดูลจัดการพัสดุและครุภัณฑ์</p>
        </div>
      </div>
    </div>

    <!-- Report Tabs -->
    <div class="card mb-4">
      <div class="card-body">
        <ul class="nav nav-pills nav-fill">
          <li class="nav-item" v-for="tab in tabs" :key="tab.key">
            <a 
              class="nav-link" 
              :class="{ active: activeTab === tab.key }"
              href="#"
              @click.prevent="selectTab(tab.key)"
            >
              <i :class="tab.icon" class="me-1"></i>
              <span class="d-none d-md-inline">{{ tab.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
      <p class="text-muted mt-2">กำลังโหลดข้อมูลรายงาน...</p>
    </div>

    <!-- Report Content -->
    <div v-else>
      <!-- Tab 1: Category Breakdown -->
      <div v-if="activeTab === 'category'" class="report-content">
        <div class="row">
          <!-- Chart Card -->
          <div class="col-lg-5 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-pie me-2"></i>สัดส่วนตามประเภท
                </h5>
              </div>
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="chart-container" style="width: 100%; max-width: 350px;">
                  <canvas ref="categoryChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Data Table -->
          <div class="col-lg-7 mb-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="fas fa-table me-2"></i>รายละเอียดตามประเภท
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>ประเภท</th>
                        <th class="text-center">จำนวน</th>
                        <th class="text-end">มูลค่าเริ่มต้น</th>
                        <th class="text-end">มูลค่าคงเหลือ</th>
                        <th class="text-center">สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in categoryData.items" :key="item.category_id">
                        <td>
                          <strong>{{ item.category_name }}</strong>
                          <small v-if="item.category_code" class="text-muted d-block">{{ item.category_code }}</small>
                        </td>
                        <td class="text-center">{{ item.asset_count }}</td>
                        <td class="text-end">{{ formatNumber(item.original_value) }}</td>
                        <td class="text-end">
                          <span :class="item.book_value < item.original_value * 0.2 ? 'text-danger' : 'text-success'">
                            {{ formatNumber(item.book_value) }}
                          </span>
                        </td>
                        <td class="text-center">
                          <span class="badge bg-primary">{{ item.percentage }}%</span>
                        </td>
                      </tr>
                      <tr v-if="categoryData.items.length === 0">
                        <td colspan="5" class="text-center text-muted py-4">ไม่พบข้อมูล</td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light" v-if="categoryData.summary">
                      <tr>
                        <th>รวมทั้งหมด</th>
                        <th class="text-center">{{ categoryData.summary.total_assets }}</th>
                        <th class="text-end">{{ formatNumber(categoryData.summary.total_original_value) }}</th>
                        <th class="text-end">{{ formatNumber(categoryData.summary.total_book_value) }}</th>
                        <th class="text-center">100%</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Depreciation Report -->
      <div v-if="activeTab === 'depreciation'" class="report-content">
        <!-- Summary Cards -->
        <div class="row g-3 mb-4" v-if="depreciationData.summary">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <div class="small">ครุภัณฑ์ทั้งหมด</div>
                <div class="h4 mb-0">{{ depreciationData.summary.total_assets }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <div class="small">มูลค่ารวมเริ่มต้น</div>
                <div class="h5 mb-0">{{ formatNumber(depreciationData.summary.total_original_value) }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div class="card-body">
                <div class="small">ค่าเสื่อมสะสมรวม</div>
                <div class="h5 mb-0">{{ formatNumber(depreciationData.summary.total_accumulated_depreciation) }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <div class="small">มูลค่าคงเหลือรวม</div>
                <div class="h5 mb-0">{{ formatNumber(depreciationData.summary.total_book_value) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-calculator me-2"></i>รายงานค่าเสื่อมราคา
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>รหัส</th>
                    <th>ชื่อครุภัณฑ์</th>
                    <th>วันที่ได้มา</th>
                    <th class="text-end">มูลค่าเริ่มต้น</th>
                    <th class="text-center">อายุใช้งาน</th>
                    <th class="text-end">ค่าเสื่อม/ปี</th>
                    <th class="text-end">ค่าเสื่อมสะสม</th>
                    <th class="text-end">มูลค่าคงเหลือ</th>
                    <th class="text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in depreciationData.items" :key="item.id">
                    <td><code>{{ item.asset_code }}</code></td>
                    <td>{{ item.asset_name }}</td>
                    <td>{{ formatDate(item.acquisition_date) }}</td>
                    <td class="text-end">{{ formatNumber(item.original_value) }}</td>
                    <td class="text-center">{{ item.useful_life_years }} ปี</td>
                    <td class="text-end">{{ formatNumber(item.annual_depreciation) }}</td>
                    <td class="text-end">{{ formatNumber(item.accumulated_depreciation) }}</td>
                    <td class="text-end">
                      <span :class="item.book_value <= 1 ? 'text-danger fw-bold' : ''">
                        {{ formatNumber(item.book_value) }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span v-if="item.is_fully_depreciated" class="badge bg-secondary">หมดค่าเสื่อม</span>
                      <span v-else class="badge bg-success">ยังมีค่าเสื่อม</span>
                    </td>
                  </tr>
                  <tr v-if="depreciationData.items.length === 0">
                    <td colspan="9" class="text-center text-muted py-4">ไม่พบข้อมูล</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Status Report -->
      <div v-if="activeTab === 'status'" class="report-content">
        <div class="row">
          <div class="col-lg-5 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-pie me-2"></i>สัดส่วนตามสถานะ
                </h5>
              </div>
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="chart-container" style="width: 100%; max-width: 350px;">
                  <canvas ref="statusChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-7 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-list me-2"></i>จำนวนครุภัณฑ์ตามสถานะ
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>สถานะ</th>
                        <th class="text-center">จำนวน</th>
                        <th class="text-end">มูลค่ารวม</th>
                        <th class="text-center">สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in statusData.items" :key="item.status">
                        <td>
                          <span class="badge me-2" :class="getStatusBadgeClass(item.status)">
                            {{ item.status_label }}
                          </span>
                        </td>
                        <td class="text-center">{{ item.count }}</td>
                        <td class="text-end">{{ formatNumber(item.total_value) }}</td>
                        <td class="text-center">
                          <div class="progress" style="height: 20px;">
                            <div 
                              class="progress-bar" 
                              :class="getStatusProgressClass(item.status)"
                              :style="{ width: item.percentage + '%' }"
                            >
                              {{ item.percentage }}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light" v-if="statusData.summary">
                      <tr>
                        <th>รวมทั้งหมด</th>
                        <th class="text-center">{{ statusData.summary.total_assets }}</th>
                        <th class="text-end">{{ formatNumber(statusData.summary.total_value) }}</th>
                        <th class="text-center">100%</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 4: Acquisition Method Report -->
      <div v-if="activeTab === 'acquisition'" class="report-content">
        <div class="row">
          <div class="col-lg-5 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-bar me-2"></i>สัดส่วนตามวิธีการได้มา
                </h5>
              </div>
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="chart-container" style="width: 100%; max-width: 350px;">
                  <canvas ref="acquisitionChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-7 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-shopping-cart me-2"></i>รายละเอียดตามวิธีการได้มา
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>วิธีการได้มา</th>
                        <th class="text-center">จำนวน</th>
                        <th class="text-end">มูลค่ารวม</th>
                        <th class="text-center">สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in acquisitionData.items" :key="item.method">
                        <td><strong>{{ item.method_label }}</strong></td>
                        <td class="text-center">{{ item.count }}</td>
                        <td class="text-end">{{ formatNumber(item.total_value) }}</td>
                        <td class="text-center">
                          <span class="badge bg-info">{{ item.percentage }}%</span>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light" v-if="acquisitionData.summary">
                      <tr>
                        <th>รวมทั้งหมด</th>
                        <th class="text-center">{{ acquisitionData.summary.total_assets }}</th>
                        <th class="text-end">{{ formatNumber(acquisitionData.summary.total_value) }}</th>
                        <th class="text-center">100%</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 5: Budget Type Report -->
      <div v-if="activeTab === 'budget'" class="report-content">
        <div class="row">
          <div class="col-lg-5 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-pie me-2"></i>สัดส่วนตามประเภทงบประมาณ
                </h5>
              </div>
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="chart-container" style="width: 100%; max-width: 350px;">
                  <canvas ref="budgetChart"></canvas>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-7 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-wallet me-2"></i>รายละเอียดตามประเภทงบประมาณ
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>ประเภทงบประมาณ</th>
                        <th class="text-center">จำนวน</th>
                        <th class="text-end">มูลค่ารวม</th>
                        <th class="text-center">สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in budgetData.items" :key="item.type">
                        <td><strong>{{ item.type_label }}</strong></td>
                        <td class="text-center">{{ item.count }}</td>
                        <td class="text-end">{{ formatNumber(item.total_value) }}</td>
                        <td class="text-center">
                          <span class="badge bg-success">{{ item.percentage }}%</span>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light" v-if="budgetData.summary">
                      <tr>
                        <th>รวมทั้งหมด</th>
                        <th class="text-center">{{ budgetData.summary.total_assets }}</th>
                        <th class="text-end">{{ formatNumber(budgetData.summary.total_value) }}</th>
                        <th class="text-center">100%</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 6: Expiring Assets Report -->
      <div v-if="activeTab === 'expiring'" class="report-content">
        <!-- Summary Cards -->
        <div class="row g-3 mb-4" v-if="expiringData.summary">
          <div class="col-md-3">
            <div class="card bg-danger text-white">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <i class="fas fa-exclamation-circle fa-2x me-3 opacity-75"></i>
                  <div>
                    <div class="small">รวมครุภัณฑ์ที่ต้องดูแล</div>
                    <div class="h3 mb-0">{{ expiringData.summary.total_expiring }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-secondary text-white">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <i class="fas fa-ban fa-2x me-3 opacity-75"></i>
                  <div>
                    <div class="small">หมดค่าเสื่อมแล้ว</div>
                    <div class="h3 mb-0">{{ expiringData.summary.fully_depreciated_count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <i class="fas fa-chart-line fa-2x me-3 opacity-75"></i>
                  <div>
                    <div class="small">มูลค่าคงเหลือต่ำ</div>
                    <div class="h3 mb-0">{{ expiringData.summary.low_value_count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <i class="fas fa-clock fa-2x me-3 opacity-75"></i>
                  <div>
                    <div class="small">ใกล้ครบอายุใช้งาน</div>
                    <div class="h3 mb-0">{{ expiringData.summary.nearing_end_count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fully Depreciated Assets -->
        <div class="card mb-4" v-if="expiringData.fully_depreciated?.count > 0">
          <div class="card-header bg-secondary text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-ban me-2"></i>
              ครุภัณฑ์ที่หมดค่าเสื่อมแล้ว ({{ expiringData.fully_depreciated.count }} รายการ)
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>รหัส</th>
                    <th>ชื่อครุภัณฑ์</th>
                    <th>ประเภท</th>
                    <th>วันที่ได้มา</th>
                    <th class="text-end">มูลค่าเริ่มต้น</th>
                    <th class="text-center">ใช้งานมาแล้ว</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in expiringData.fully_depreciated.items" :key="item.id">
                    <td><code>{{ item.asset_code }}</code></td>
                    <td>{{ item.asset_name }}</td>
                    <td>{{ item.category_name }}</td>
                    <td>{{ formatDate(item.acquisition_date) }}</td>
                    <td class="text-end">{{ formatNumber(item.original_value) }}</td>
                    <td class="text-center">{{ item.years_used }} ปี</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Low Value Assets -->
        <div class="card mb-4" v-if="expiringData.low_value?.count > 0">
          <div class="card-header bg-warning text-dark">
            <h5 class="card-title mb-0">
              <i class="fas fa-chart-line me-2"></i>
              ครุภัณฑ์ที่มูลค่าคงเหลือต่ำ ({{ expiringData.low_value.count }} รายการ)
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>รหัส</th>
                    <th>ชื่อครุภัณฑ์</th>
                    <th>ประเภท</th>
                    <th class="text-end">มูลค่าเริ่มต้น</th>
                    <th class="text-end">มูลค่าคงเหลือ</th>
                    <th class="text-center">คงเหลือ %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in expiringData.low_value.items" :key="item.id">
                    <td><code>{{ item.asset_code }}</code></td>
                    <td>{{ item.asset_name }}</td>
                    <td>{{ item.category_name }}</td>
                    <td class="text-end">{{ formatNumber(item.original_value) }}</td>
                    <td class="text-end text-danger">{{ formatNumber(item.book_value) }}</td>
                    <td class="text-center">
                      <span class="badge bg-danger">{{ item.percent_remaining }}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Nearing End of Life Assets -->
        <div class="card mb-4" v-if="expiringData.nearing_end_of_life?.count > 0">
          <div class="card-header bg-info text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-clock me-2"></i>
              ครุภัณฑ์ที่ใกล้ครบอายุใช้งาน ({{ expiringData.nearing_end_of_life.count }} รายการ)
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>รหัส</th>
                    <th>ชื่อครุภัณฑ์</th>
                    <th>ประเภท</th>
                    <th class="text-center">อายุใช้งาน</th>
                    <th class="text-center">ใช้งานมาแล้ว</th>
                    <th class="text-center">เหลืออีก</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in expiringData.nearing_end_of_life.items" :key="item.id">
                    <td><code>{{ item.asset_code }}</code></td>
                    <td>{{ item.asset_name }}</td>
                    <td>{{ item.category_name }}</td>
                    <td class="text-center">{{ item.useful_life_years }} ปี</td>
                    <td class="text-center">{{ item.years_used }} ปี</td>
                    <td class="text-center">
                      <span class="badge bg-info">{{ item.years_remaining }} ปี</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- No Data Message -->
        <div class="card" v-if="expiringData.summary?.total_expiring === 0">
          <div class="card-body text-center py-5">
            <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
            <h4>ไม่มีครุภัณฑ์ที่ต้องดูแลเป็นพิเศษ</h4>
            <p class="text-muted">ครุภัณฑ์ทั้งหมดอยู่ในสถานะปกติ</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import api from '@/services/api';
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';

const loading = ref(false);
const activeTab = ref('category');

const tabs = [
  { key: 'category', label: 'ตามประเภท', icon: 'fas fa-tags' },
  { key: 'depreciation', label: 'ค่าเสื่อมราคา', icon: 'fas fa-calculator' },
  { key: 'status', label: 'ตามสถานะ', icon: 'fas fa-toggle-on' },
  { key: 'acquisition', label: 'วิธีการได้มา', icon: 'fas fa-shopping-cart' },
  { key: 'budget', label: 'งบประมาณ', icon: 'fas fa-wallet' },
  { key: 'expiring', label: 'ใกล้หมดอายุ', icon: 'fas fa-exclamation-triangle' },
];

// Data for each report
const categoryData = reactive({ items: [], summary: null });
const depreciationData = reactive({ items: [], summary: null });
const statusData = reactive({ items: [], summary: null });
const acquisitionData = reactive({ items: [], summary: null });
const budgetData = reactive({ items: [], summary: null });
const expiringData = reactive({ 
  fully_depreciated: { items: [], count: 0 },
  low_value: { items: [], count: 0 },
  nearing_end_of_life: { items: [], count: 0 },
  summary: null 
});

// Chart refs
const categoryChart = ref(null);
const statusChart = ref(null);
const acquisitionChart = ref(null);
const budgetChart = ref(null);

// Chart instances
let categoryChartInstance = null;
let statusChartInstance = null;
let acquisitionChartInstance = null;
let budgetChartInstance = null;

const chartColors = [
  'rgba(54, 162, 235, 0.8)',
  'rgba(255, 99, 132, 0.8)',
  'rgba(75, 192, 192, 0.8)',
  'rgba(255, 206, 86, 0.8)',
  'rgba(153, 102, 255, 0.8)',
  'rgba(255, 159, 64, 0.8)',
  'rgba(199, 199, 199, 0.8)',
  'rgba(83, 102, 255, 0.8)',
];

const statusColors = {
  1: 'rgba(40, 167, 69, 0.8)',   // success - ใช้งานอยู่
  2: 'rgba(108, 117, 125, 0.8)', // secondary - ไม่ได้ใช้งาน
  3: 'rgba(52, 58, 64, 0.8)',    // dark - จำหน่าย
  4: 'rgba(255, 193, 7, 0.8)',   // warning - กำลังซ่อมแซม
  5: 'rgba(220, 53, 69, 0.8)',   // danger - ไม่ทราบสถานะ
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH').format(num || 0);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusBadgeClass = (status) => {
  const classes = {
    1: 'bg-success',
    2: 'bg-secondary',
    3: 'bg-dark',
    4: 'bg-warning text-dark',
    5: 'bg-danger'
  };
  return classes[status] || 'bg-light text-dark';
};

const getStatusProgressClass = (status) => {
  const classes = {
    1: 'bg-success',
    2: 'bg-secondary',
    3: 'bg-dark',
    4: 'bg-warning',
    5: 'bg-danger'
  };
  return classes[status] || 'bg-primary';
};

const selectTab = async (tab) => {
  activeTab.value = tab;
  await loadReportData(tab);
};

const loadReportData = async (tab) => {
  loading.value = true;
  
  try {
    switch (tab) {
      case 'category':
        await loadCategoryReport();
        break;
      case 'depreciation':
        await loadDepreciationReport();
        break;
      case 'status':
        await loadStatusReport();
        break;
      case 'acquisition':
        await loadAcquisitionReport();
        break;
      case 'budget':
        await loadBudgetReport();
        break;
      case 'expiring':
        await loadExpiringReport();
        break;
    }
  } catch (error) {
    console.error('Error loading report:', error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลรายงานได้', 'error');
  } finally {
    loading.value = false;
  }
};

const loadCategoryReport = async () => {
  const response = await api.get('/asset-reports/category-breakdown');
  if (response.data.success) {
    categoryData.items = response.data.data.items;
    categoryData.summary = response.data.data.summary;
    
    await nextTick();
    setTimeout(() => {
      renderCategoryChart();
    }, 100);
  }
};

const loadDepreciationReport = async () => {
  const response = await api.get('/asset-reports/depreciation');
  if (response.data.success) {
    depreciationData.items = response.data.data.items;
    depreciationData.summary = response.data.data.summary;
  }
};

const loadStatusReport = async () => {
  const response = await api.get('/asset-reports/by-status');
  if (response.data.success) {
    statusData.items = response.data.data.items;
    statusData.summary = response.data.data.summary;
    
    await nextTick();
    setTimeout(() => {
      renderStatusChart();
    }, 100);
  }
};

const loadAcquisitionReport = async () => {
  const response = await api.get('/asset-reports/by-acquisition-method');
  if (response.data.success) {
    acquisitionData.items = response.data.data.items;
    acquisitionData.summary = response.data.data.summary;
    
    await nextTick();
    setTimeout(() => {
      renderAcquisitionChart();
    }, 100);
  }
};

const loadBudgetReport = async () => {
  const response = await api.get('/asset-reports/by-budget-type');
  if (response.data.success) {
    budgetData.items = response.data.data.items;
    budgetData.summary = response.data.data.summary;
    
    await nextTick();
    setTimeout(() => {
      renderBudgetChart();
    }, 100);
  }
};

const loadExpiringReport = async () => {
  const response = await api.get('/asset-reports/expiring');
  if (response.data.success) {
    expiringData.fully_depreciated = response.data.data.fully_depreciated;
    expiringData.low_value = response.data.data.low_value;
    expiringData.nearing_end_of_life = response.data.data.nearing_end_of_life;
    expiringData.summary = response.data.data.summary;
  }
};

const renderCategoryChart = () => {
  if (!categoryChart.value) {
    console.log('categoryChart ref not available');
    return;
  }
  
  // Filter items with data
  const itemsWithData = categoryData.items.filter(item => item.original_value > 0);
  if (itemsWithData.length === 0) {
    console.log('No data for category chart');
    return;
  }
  
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
    categoryChartInstance = null;
  }
  
  const ctx = categoryChart.value.getContext('2d');
  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: itemsWithData.map(item => item.category_name),
      datasets: [{
        data: itemsWithData.map(item => item.original_value),
        backgroundColor: chartColors.slice(0, itemsWithData.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true
          }
        }
      }
    }
  });
};

const renderStatusChart = () => {
  if (!statusChart.value) {
    console.log('statusChart ref not available');
    return;
  }
  
  // Filter items with data
  const itemsWithData = statusData.items.filter(item => item.count > 0);
  if (itemsWithData.length === 0) {
    console.log('No data for status chart');
    return;
  }
  
  if (statusChartInstance) {
    statusChartInstance.destroy();
    statusChartInstance = null;
  }
  
  const ctx = statusChart.value.getContext('2d');
  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: itemsWithData.map(item => item.status_label),
      datasets: [{
        data: itemsWithData.map(item => item.count),
        backgroundColor: itemsWithData.map(item => statusColors[item.status]),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true
          }
        }
      }
    }
  });
};

const renderAcquisitionChart = () => {
  if (!acquisitionChart.value) {
    console.log('acquisitionChart ref not available');
    return;
  }
  
  // Filter items with data
  const itemsWithData = acquisitionData.items.filter(item => item.count > 0);
  if (itemsWithData.length === 0) {
    console.log('No data for acquisition chart');
    return;
  }
  
  if (acquisitionChartInstance) {
    acquisitionChartInstance.destroy();
    acquisitionChartInstance = null;
  }
  
  const ctx = acquisitionChart.value.getContext('2d');
  acquisitionChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: itemsWithData.map(item => item.method_label),
      datasets: [{
        label: 'จำนวนครุภัณฑ์',
        data: itemsWithData.map(item => item.count),
        backgroundColor: chartColors.slice(0, itemsWithData.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
};

const renderBudgetChart = () => {
  if (!budgetChart.value) {
    console.log('budgetChart ref not available');
    return;
  }
  
  // Filter items with data
  const itemsWithData = budgetData.items.filter(item => item.total_value > 0);
  if (itemsWithData.length === 0) {
    console.log('No data for budget chart');
    return;
  }
  
  if (budgetChartInstance) {
    budgetChartInstance.destroy();
    budgetChartInstance = null;
  }
  
  const ctx = budgetChart.value.getContext('2d');
  budgetChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: itemsWithData.map(item => item.type_label),
      datasets: [{
        data: itemsWithData.map(item => item.total_value),
        backgroundColor: chartColors.slice(0, itemsWithData.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true
          }
        }
      }
    }
  });
};

onMounted(async () => {
  await loadReportData('category');
});
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0;
}

.nav-pills .nav-link {
  color: #6c757d;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-pills .nav-link:hover {
  background-color: #e9ecef;
  color: #495057;
}

.nav-pills .nav-link.active {
  background-color: #0d6efd;
  color: white;
}

.chart-container {
  position: relative;
  height: 300px;
}

.table-sm th,
.table-sm td {
  padding: 0.5rem;
}

.progress {
  border-radius: 0.5rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}
</style>
