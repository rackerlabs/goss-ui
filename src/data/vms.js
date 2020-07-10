import { fetch } from '../data/fetch';
import _ from 'lodash';

export const GOSSServices = {
  ANTIVIRUS: 'com.rackspace.goss.goss.vm.services.antivirus',
  BACKUP: 'com.rackspace.goss.goss.vm.services.backup',
  DISASTER_RECOVERY: 'com.rackspace.goss.goss.vm.services.disasterRecovery',
  OS_ADMINISTRATION: 'com.rackspace.goss.goss.vm.services.os.admin',
  MONITORING: 'com.rackspace.goss.goss.vm.services.monitoring',
  PATCHING: 'com.rackspace.goss.goss.vm.services.patching',
};

const GOSSOSDisplayNames = {
  linuxGuest: 'Linux',
  linux: 'Linux',
  windowsGuest: 'Windows',
  windows: 'Windows',
};

const GOSSSupportedOSes = [
  'Red Hat Enterprise Linux 6 (64-bit)',
  'Red Hat Enterprise Linux 7 (64-bit)',
  'Red Hat Enterprise Linux 8 (64-bit)',
  'CentOS 6 (64-bit)',
  'CentOS 7 (64-bit)',
  'CentOS 8 (64-bit)',
  'Ubuntu Linux (64-bit)',
  'Microsoft Windows Server 2012 (64-bit)',
  'Microsoft Windows Server 2016 (64-bit)',
  'Microsoft Windows Server 2019 (64-bit)',
];

export const listVMs = async ({ organizationId, sddcId, domain }) => {
  const config = domain ? { headers: { 'X-Tenant-Id': domain } } : {};
  const res = await fetch(`/api/vmc/v1.0/orgs/${organizationId}/sddcs/${sddcId}/vms`, config);
  const body = await res.json();
  return body.data.items;
};

export const enrollVM = async ({ organizationId, sddcId, vmId, domain }, { services, username, password }) => {
  const params = {
    method: 'POST',
    body: JSON.stringify({
      services,
      vm_username: username,
      vm_password: password,
    }),
  };
  if (domain) {
    params['headers'] = { 'X-Tenant-Id': domain };
  }
  await fetch(`/api/vmc/v1.0/orgs/${organizationId}/sddcs/${sddcId}/vms/${vmId}/enroll`, params);
};

export const guestFamilyDisplayName = vm => {
  if (!isPoweredOn(vm)) {
    const os_type = getCustomAttributeValue(vm, 'com.rackspace.goss.goss.vm.os_type');
    if (os_type) {
      return GOSSOSDisplayNames[os_type];
    }
    return 'Powered Off';
  } else if (!isGOSSSupported(vm)) {
    return 'Unsupported';
  }
  return GOSSOSDisplayNames[vm.guest.guestFamily];
};

export const isGOSSSupported = vm => {
  if (vm._rackspace.isManagementVM === true) {
    return false;
  }
  if (isPoweredOn(vm)) {
    return GOSSSupportedOSes.includes(vm.guest.guestFullName);
  } else {
    let unsupported = getCustomAttributeValue(vm, 'com.rackspace.goss.goss.os.unsupported');
    return unsupported == null && unsupported !== true;
  }
};

export const enrolledInGOSSService = (vm, service) => {
  return getCustomAttributeValue(vm, service) === 'enrolled';
};

export const isPoweredOn = vm => {
  return vm.guest.guestState === 'running';
};

export const getServiceListForVM = vm => {
  return Object.keys(GOSSServices).reduce((acc, service) => {
    if (enrolledInGOSSService(vm, GOSSServices[service])) {
      return [...acc, GOSSServices[service]];
    }

    return acc;
  }, []);
};

export const managedInstanceId = vm => {
  return getCustomAttributeValue(vm, 'com.rackspace.goss.goss.vm.ssmid');
};

const getCustomAttributeValue = (vm, name) => {
  const attr = vm.availableField.find(f => f.name === name);
  if (!attr) {
    return null;
  }

  const value = vm.value.find(v => v.key === attr.key);
  if (!value) {
    return null;
  }

  return value.value;
};

export const generateVMEnrollmentCSVData = vms => {
  let data = [['Name', 'Instance UUID', 'OS Administration', 'Monitoring', 'Patching', 'OS Type']];
  _.each(vms, vm => {
    data.push([
      vm.name,
      vm.config$uuid,
      enrolledInGOSSService(vm, GOSSServices.OS_ADMINISTRATION),
      enrolledInGOSSService(vm, GOSSServices.MONITORING),
      enrolledInGOSSService(vm, GOSSServices.PATCHING),
      guestFamilyDisplayName(vm),
    ]);
  });
  return data;
};
